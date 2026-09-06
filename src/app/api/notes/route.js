import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const LOCAL_DB_PATH = path.join(process.cwd(), 'local_db.json');

function getLocalNotes(userId) {
  if (!fs.existsSync(LOCAL_DB_PATH)) return [];
  try {
    const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    if (!db.notes) db.notes = [];
    return db.notes.filter(n => !userId || n.user_id === userId);
  } catch (err) {
    return [];
  }
}

function saveLocalNote(note) {
  let db = { notes: [] };
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      if (!db.notes) db.notes = [];
    } catch (e) {}
  }
  const existingIdx = db.notes.findIndex(n => n.id === note.id);
  if (existingIdx >= 0) {
    db.notes[existingIdx] = { ...db.notes[existingIdx], ...note, updated_at: new Date().toISOString() };
  } else {
    db.notes.unshift({
      ...note,
      id: note.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  return db.notes.find(n => n.id === note.id) || db.notes[0];
}

function deleteLocalNote(noteId, userId) {
  if (!fs.existsSync(LOCAL_DB_PATH)) return true;
  try {
    const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    if (!db.notes) return true;
    db.notes = db.notes.filter(n => n.id !== noteId || (userId && n.user_id !== userId));
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-trader';

  try {
    // Try Supabase first
    const { data: sbNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && sbNotes) {
      return NextResponse.json({ notes: sbNotes });
    }
  } catch (err) {
    // Fallback to local DB
  }

  const localNotes = getLocalNotes(userId);
  return NextResponse.json({ notes: localNotes });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'demo-trader';

  try {
    const body = await request.json();
    const { title, content, tags, linked_news_id, category } = body;

    if (!content && !title) {
      return NextResponse.json({ error: 'Note content or title is required' }, { status: 400 });
    }

    const newNote = {
      user_id: userId,
      title: title || 'Untitled Note',
      content: content || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      linked_news_id: linked_news_id || null,
      category: category || 'General',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try Supabase first
    try {
      const { data: sbNote, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (!error && sbNote) {
        return NextResponse.json({ note: sbNote, success: true });
      }
    } catch (err) {
      // Fallback to local
    }

    const saved = saveLocalNote(newNote);
    return NextResponse.json({ note: saved, success: true });
  } catch (err) {
    console.error('Failed to create note:', err);
    return NextResponse.json({ error: err.message || 'Failed to save note' }, { status: 500 });
  }
}

export async function PUT(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'demo-trader';

  try {
    const body = await request.json();
    const { id, title, content, tags, linked_news_id, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required for update' }, { status: 400 });
    }

    const updates = {
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      linked_news_id: linked_news_id || null,
      category: category || 'General',
      updated_at: new Date().toISOString()
    };

    try {
      const { data: sbNote, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && sbNote) {
        return NextResponse.json({ note: sbNote, success: true });
      }
    } catch (e) {}

    const updatedLocal = saveLocalNote({ id, user_id: userId, ...updates });
    return NextResponse.json({ note: updatedLocal, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'demo-trader';

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  try {
    await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
  } catch (e) {}

  deleteLocalNote(id, userId);
  return NextResponse.json({ success: true, message: 'Note deleted' });
}

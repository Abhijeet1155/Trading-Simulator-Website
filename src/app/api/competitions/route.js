import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('id');

    // 1. Fetch data from Supabase via Admin Client
    const [compsRes, partsRes, walletsRes, usersRes] = await Promise.all([
      supabaseAdmin.from('competitions').select('*'),
      supabaseAdmin.from('competition_participants').select('*'),
      supabaseAdmin.from('wallets').select('user_id, virtual_balance, balance_configured'),
      supabaseAdmin.from('users').select('id, name')
    ]);

    if (compsRes.error) {
      console.error('[Competitions API] Error fetching competitions:', compsRes.error);
      throw compsRes.error;
    }

    const dbCompetitions = compsRes.data || [];
    const dbParticipants = partsRes.data || [];
    const dbWallets = walletsRes.data || [];
    const dbUsers = usersRes.data || [];

    // Map wallets and users for fast lookups
    const walletsMap = {};
    const walletsConfiguredMap = {};
    dbWallets.forEach(w => {
      walletsMap[w.user_id] = (walletsMap[w.user_id] || 0) + parseFloat(w.virtual_balance || 0);
      walletsConfiguredMap[w.user_id] = walletsConfiguredMap[w.user_id] || w.balance_configured || false;
    });

    const usersMap = {};
    dbUsers.forEach(u => {
      usersMap[u.id] = u.name || 'Anonymous';
    });

    // Sync user's own current_balance in the database if they are participating
    const userWalletBalance = walletsMap[user.id] ?? 0.00;
    const balanceConfigured = walletsConfiguredMap[user.id] ?? false;
    
    // Find all participations of the current user
    const userParticipations = dbParticipants.filter(p => p.user_id === user.id);
    
    if (userParticipations.length > 0) {
      for (const p of userParticipations) {
        if (parseFloat(p.current_balance) !== userWalletBalance) {
          await supabaseAdmin
            .from('competition_participants')
            .update({ current_balance: userWalletBalance })
            .eq('id', p.id);
          p.current_balance = userWalletBalance; // update in local array for immediate display
        }
      }
    }

    // Helper to calculate P&L% for a participant
    const calcPnL = (starting, current) => {
      const start = parseFloat(starting);
      const curr = parseFloat(current);
      if (!start || start === 0) return 0;
      return ((curr - start) / start) * 100;
    };

    // If requesting detail view for a specific competition
    if (competitionId) {
      const competition = dbCompetitions.find(c => c.id === competitionId);
      if (!competition) {
        return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
      }

      // Get participants for this competition
      const compParticipants = dbParticipants
        .filter(p => p.competition_id === competitionId)
        .map(p => {
          const latestBalance = walletsMap[p.user_id] ?? parseFloat(p.current_balance);
          const pnlPercent = calcPnL(p.starting_balance, latestBalance);
          return {
            ...p,
            current_balance: latestBalance,
            name: usersMap[p.user_id] || 'Anonymous',
            pnl_percent: pnlPercent
          };
        });

      // Sort participants by P&L% descending to calculate rank
      compParticipants.sort((a, b) => b.pnl_percent - a.pnl_percent);

      // Assign ranks in memory
      const rankedParticipants = compParticipants.map((p, idx) => ({
        ...p,
        rank: idx + 1
      }));

      // Find the current user's participation and ranking
      const userPart = rankedParticipants.find(p => p.user_id === user.id);
      const top5 = rankedParticipants.slice(0, 5);

      return NextResponse.json({
        competition,
        joined: !!userPart,
        userProgress: userPart || null,
        top5,
        participants: rankedParticipants,
        totalParticipants: rankedParticipants.length,
        userRank: userPart ? userPart.rank : null
      });
    }

    // Default: Return list of active and upcoming competitions
    const now = new Date();

    // Map participant counts and user join status
    const formattedCompetitions = dbCompetitions.map(c => {
      const participants = dbParticipants.filter(p => p.competition_id === c.id);
      const userPart = participants.find(p => p.user_id === user.id);
      
      let userProgress = null;
      if (userPart) {
        const latestBalance = walletsMap[user.id] ?? parseFloat(userPart.current_balance);
        const pnlPercent = calcPnL(userPart.starting_balance, latestBalance);
        userProgress = {
          ...userPart,
          current_balance: latestBalance,
          pnl_percent: pnlPercent
        };
      }

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        entry_fee: parseFloat(c.entry_fee),
        start_date: c.start_date,
        end_date: c.end_date,
        target_profit_percent: parseFloat(c.target_profit_percent),
        status: c.status,
        is_premium_only: !!c.is_premium_only,
        participantCount: participants.length,
        joined: !!userPart,
        userProgress
      };
    });

    // Filter user's active joined competitions for "My Active Competitions" section
    const myJoinedCompetitions = formattedCompetitions.filter(c => c.joined && new Date(c.end_date) >= now);

    return NextResponse.json({
      competitions: formattedCompetitions,
      myActiveCompetitions: myJoinedCompetitions,
      userWalletBalance,
      balanceConfigured
    });

  } catch (error) {
    console.error('[Competitions GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch competitions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { competitionId } = await req.json();
    if (!competitionId) {
      return NextResponse.json({ error: 'Competition ID is required' }, { status: 400 });
    }

    // 1. Get competition details to find entry fee, starting equity, and premium-only status
    const { data: comp, error: compErr } = await supabaseAdmin
      .from('competitions')
      .select('entry_fee, initial_equity, is_premium_only')
      .eq('id', competitionId)
      .single();

    if (compErr || !comp) {
      console.error('[Competitions POST] Competition lookup error:', compErr);
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    // Check if competition is restricted to premium users only
    if (comp.is_premium_only) {
      let planType = 'free';
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('plan_type')
          .eq('id', user.id)
          .single();
        if (dbUser && dbUser.plan_type) {
          planType = dbUser.plan_type.toLowerCase();
        }
      } catch (e) {
        // default to free
      }

      if (planType !== 'premium') {
        return NextResponse.json({ 
          error: 'Upgrade to Pro to join this competition' 
        }, { status: 403 });
      }
    }

    const entryFee = comp ? parseFloat(comp.entry_fee) : 0;
    const initialEquity = comp && comp.initial_equity ? parseFloat(comp.initial_equity) : 10000;

    // 2. Resolve active wallet
    const { activeWallet } = await getActiveWallet(user.id);
    const userWalletBalance = parseFloat(activeWallet.virtual_balance || 0);
    const balanceConfigured = activeWallet.balance_configured || false;

    // Check if user has configured starting balance
    if (!balanceConfigured) {
      return NextResponse.json({ error: 'Please set your starting balance on the Dashboard before joining a competition' }, { status: 400 });
    }

    // Check if user has sufficient balance for the entry fee
    if (userWalletBalance < entryFee) {
      return NextResponse.json({ error: 'Insufficient balance to join this competition.' }, { status: 400 });
    }

    const balanceAfterFee = userWalletBalance - entryFee;

    // 3. Register participant and update wallet balance using Admin Client
    const newParticipant = {
      competition_id: competitionId,
      user_id: user.id,
      starting_balance: initialEquity,
      current_balance: initialEquity,
      status: 'active'
    };

    // Deduct fee from active wallet
    const { error: walletUpdateErr } = await supabaseAdmin
      .from('wallets')
      .update({ virtual_balance: balanceAfterFee, updated_at: new Date().toISOString() })
      .eq('id', activeWallet.id);
    
    if (walletUpdateErr) {
      console.error('[Competitions POST] Wallet fee deduction error:', walletUpdateErr);
      return NextResponse.json({ error: 'Failed to deduct entry fee from wallet' }, { status: 500 });
    }

    const { error: insertErr } = await supabaseAdmin
      .from('competition_participants')
      .insert(newParticipant);
    
    if (insertErr) {
      console.error('[Competitions POST] Participant insert error:', insertErr);
      // Rollback wallet balance if participant insert fails
      await supabaseAdmin
        .from('wallets')
        .update({ virtual_balance: userWalletBalance, updated_at: new Date().toISOString() })
        .eq('id', activeWallet.id);

      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'You have already joined this competition.' }, { status: 400 });
      }
      return NextResponse.json({ error: insertErr.message || 'Failed to join competition' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Competitions POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to join competition' }, { status: 500 });
  }
}


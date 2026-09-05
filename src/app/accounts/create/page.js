import { redirect } from 'next/navigation';

export default function AccountsCreateRedirect() {
  redirect('/account-setup');
}

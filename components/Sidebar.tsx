import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/app/actions/user.action';
import UnAuthenticatedSidebar from './UnAuthenticatedSidebar';
import SidebarClient from './SidebarClient';

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  
  const safeUser = {
    ...user,
    location: user.location ?? '',
    website: user.website ?? ''
  };

  return <SidebarClient user={safeUser} />;
}

export default Sidebar;
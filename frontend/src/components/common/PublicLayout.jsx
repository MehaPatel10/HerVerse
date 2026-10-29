import { Outlet } from 'react-router-dom';
import PublicNav from './PublicNav.jsx';
import PublicFooter from './PublicFooter.jsx';

export default function PublicLayout() {
  return (
    <div>
      <PublicNav />
      <Outlet />
      <PublicFooter />
    </div>
  );
}

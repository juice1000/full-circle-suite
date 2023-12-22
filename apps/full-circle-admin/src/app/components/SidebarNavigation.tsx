import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ArrowDownIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '../../utls';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Control Panel', href: '/controls', icon: UsersIcon, current: false },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    current: false,
  },
];

const SidebarNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  function handleSignOut() {
    console.log('signout');
    navigate('/login');
  }
  return (
    <div className="flex">
      <nav className="w-64 h-screen bg-primary-dark pl-8 py-14">
        <ul className="grid gap-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={classNames(
                  location.pathname === item.href
                    ? 'hover:text-neutral-500 underline underline-offset-4'
                    : 'text-black hover:text-neutral-500 ',
                  'group flex items-center gap-x-3 rounded-md mr-8 font-semibold'
                )}
              >
                <item.icon
                  className={classNames(
                    location.pathname === item.href
                      ? 'text-neutral-500 '
                      : 'text-black group-hover:text-neutral-500',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    location.pathname === item.href
                      ? 'text-neutral-500'
                      : 'text-black group-hover:text-neutral-500'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSignOut}
          className="mt-12 text-black hover:text-neutral-500 group flex gap-x-3 rounded-md mr-8 font-semibold"
        >
          <ArrowDownIcon
            className={
              'text-black group-hover:text-neutral-500 h-6 w-6 shrink-0'
            }
            aria-hidden="true"
          />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default SidebarNavigation;

import { APP_STRINGS } from '../../constants/strings';
import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNavbar: React.FC = () => {
  return (
    <nav className="w-179 p-4">
      <ul className="space-y-4">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? 'block py-2 px-4 rounded bg-gray-700 text-white' : 'block py-2 px-4 rounded hover:bg-gray-700'
            }
          >
            {APP_STRINGS.USERS}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/statistics"
            className={({ isActive }) =>
              isActive ? 'block py-2 px-4 rounded bg-gray-700 text-white' : 'block py-2 px-4 rounded hover:bg-gray-700'
            }
          >
            {APP_STRINGS.STATISTICS}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;

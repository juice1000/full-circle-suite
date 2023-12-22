interface SidebarProps {
  onSignOut: () => void;
}

const SidebarNavigation = (props: SidebarProps) => {
  return (
    <div className="flex">
      <nav className="w-64 h-screen bg-primary-dark pl-8 py-14">
        <ul className="gap-8">
          <li>Link 1</li>
          <li>Link 2</li>
          <li>Link 3</li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
    </div>
  );
};

export default SidebarNavigation;

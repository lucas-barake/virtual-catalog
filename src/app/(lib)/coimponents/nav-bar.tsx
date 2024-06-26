export const NavBar: React.FC = () => (
  <nav className="bg-white shadow-md">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 justify-between">
        <div className="flex">
          <div className="flex flex-shrink-0 items-center">
            <span className="text-2xl font-bold text-indigo-600">Catalog</span>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a
              href="#"
              className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
            >
              Home
            </a>
            <a
              href="#"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Products
            </a>
            <a
              href="#"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              About
            </a>
            <a
              href="#"
              className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

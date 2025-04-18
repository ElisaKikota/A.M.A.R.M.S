const Header = () => (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
        <Plus size={20} />
        New Project
      </button>
    </header>
  );
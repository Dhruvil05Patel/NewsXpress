import SideBar from './components/SideBar';
import AllNews from './components/categories/AllNews';

function App() {
  return (
    
    <div className="min-h-screen bg-gray-50">
      <SideBar />
      <AllNews
        title="Latest News"
        subtitle="Stay updated with global headlines"
      />
    </div>
  );
} 

export default App;
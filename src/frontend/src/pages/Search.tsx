import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';

const Search = () => {
  return (
    <div>
      <Header />
      <main>
        <div className="px-4 py-6 sm:px-0">
          <h1>{APP_STRINGS.SEARCH_TITLE}</h1>
          {/* Add your Search content here */}
        </div>
      </main>
    </div>
  );
};

export default Search;

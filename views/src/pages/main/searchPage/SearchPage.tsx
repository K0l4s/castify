import { useLocation } from "react-router-dom";

const SearchPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search).get('keyword');
    console.log(queryParams);
    return (
        <div>SearchPage</div>
    )
}

export default SearchPage
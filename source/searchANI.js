let isSearchResultsVisible = false; // Boolean flag to track search results visibility
        
        const searchCollapse = document.getElementById('search-collapse');
        const searchResults = document.getElementById('search-results');
        const tempScreen = document.getElementById('temp-screen');

        document.getElementById('close-search').addEventListener('click', function() {
            // isSearchResultsVisible = false; // Update the flag
            // searchResults.classList.remove('show');
            const searchBT = document.getElementById("search-button");
            searchBT.click();
            console.log('Search results closed');
        });

        document.getElementById('search-button').addEventListener('click', function() {
            const searchCollapse = document.getElementById('search-collapse');
            const searchResults = document.getElementById('search-results');
            const tempScreen = document.getElementById('temp-screen');
            if (searchCollapse.classList.contains('show')) {
                if (isSearchResultsVisible) {
                    searchResults.classList.remove('show'); // Hide the temp screen
                    isSearchResultsVisible = false;

                    setTimeout(() => {
                        searchCollapse.classList.remove('show');
                        tempScreen.style.display = 'none';
                        setTimeout(() => {
                            searchCollapse.style.display = 'none';
                        }, 500);
                    }, 300);
                } else {
                    searchCollapse.classList.remove('show');
                    setTimeout(() => {
                        searchCollapse.style.display = 'none';
                        tempScreen.style.display = 'none';
                    }, 500);
                }
            } else {
                searchCollapse.style.display = 'block';
                setTimeout(() => {
                    searchCollapse.classList.add('show');
                }, 10);

                setTimeout(() => {
                    searchResults.classList.add('show');
                    isSearchResultsVisible = true;
                    //console.log('tempScreen display set to block in Coffee.html');
                    tempScreen.style.display = 'block'; // Show the temp screen
                }, 300);
            }
            if(screen.width < 450){
                    const uhhbutton = document.getElementById('collapse-navber-toggler');
                    uhhbutton.click();
            }
        });
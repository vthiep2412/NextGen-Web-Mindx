// Get references to the input field and suggestion container
const addressInput = document.getElementById("address-autocomplete");
const suggestionsContainer = document.getElementById("autocomplete-suggestions");

// Listen for input events on the address textbox
addressInput.addEventListener("input", function(e) {
  const query = e.target.value.trim();
  
  // Only perform the API request if at least 2 characters are entered
  if(query.length < 2) {
    suggestionsContainer.innerHTML = "";
    return;
  }
  
  // Debug: log the query
  console.log("Searching for:", query);
  
  // Call the Geoapify autocomplete API using the entered text
  fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=120f5abe170540a0a3616e98cf973009`)
    .then(response => response.json())
    .then(result => {
      // Debug: log the API result
      console.log("Autocomplete result:", result);
      
      // Clear any existing suggestions
      suggestionsContainer.innerHTML = "";
      
      // Iterate through the returned features and display suggestions
      result.features.forEach(feature => {
        // Create a new list item for each suggestion
        const li = document.createElement("li");
        li.textContent = feature.properties.formatted;
        li.style.padding = "8px";
        li.style.cursor = "pointer";
        li.style.borderBottom = "1px solid #eee";
        
        // When a suggestion is clicked, set the input's value and clear suggestions
        li.addEventListener("click", () => {
          addressInput.value = feature.properties.formatted;
          suggestionsContainer.innerHTML = "";
        });
        
        // Append the suggestion to the container
        suggestionsContainer.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error fetching autocomplete suggestions:", error);
    });
});

async function loadAdhkarData() {
  try {
    const response = await fetch("adhkar.json");
    const data = await response.json();
    console.log(data); // Debugging line to check data structure

    // Check for valid data structure
    if (data && Array.isArray(data) && data.length > 0) {
      createAdhkarButtons(data); // Pass the entire data array
    } else {
      console.error("Invalid data structure:", data);
    }
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

function createAdhkarButtons(data) {
  const buttonsContainer = document.getElementById("adhkar-buttons");
  buttonsContainer.innerHTML = "";

  // Create buttons based on the category of each object
  data.forEach((item) => {
    const button = document.createElement("button");
    button.innerText = `${item.category}`;
    button.onclick = function () {
      showZikrInModal(item); // Show Zikr details in modal
    };
    button.setAttribute("data-category", item.category.toLowerCase()); // Set data attribute for filtering
    buttonsContainer.appendChild(button);
  });
}

function showZikrInModal(adhkar) {
  const modal = document.getElementById("modal");
  const modalDetails = document.getElementById("modal-details");
  modalDetails.innerHTML = `<div style="text-align: center;"><h2>${adhkar.category}</h2><hr></div>`;
  // Set the category title

  // Display all texts in the array
  adhkar.array.forEach((item) => {
    const adhkarText = document.createElement("p");
    adhkarText.innerHTML = item.text; // Add text from each item
    modalDetails.appendChild(adhkarText);
  });

  modal.style.display = "block"; // Show the modal
}

// Adjust text size based on range input
document
  .getElementById("text-size-range")
  .addEventListener("input", function () {
    const modalDetails = document.getElementById("modal-details");
    modalDetails.style.fontSize = this.value + "px"; // Set font size
  });
// Close the modal when the user clicks on <span> (x) or outside the modal
document.getElementById("close-modal").onclick = function () {
  document.getElementById("modal").style.display = "none";
};

// Filter function to search by category
function filterByCategory() {
  const input = document.getElementById("search-input").value.toLowerCase();
  const buttons = document.querySelectorAll("#adhkar-buttons button");

  buttons.forEach((button) => {
    const buttonCategory = button.getAttribute("data-category");
    button.style.display = buttonCategory.includes(input)
      ? "inline-block"
      : "none";
  });
}

// Event listener for the search input
document
  .getElementById("search-input")
  .addEventListener("input", filterByCategory);

// Call the function to load Adhkar data when the page loads
window.onload = function () {
  loadAdhkarData();
};

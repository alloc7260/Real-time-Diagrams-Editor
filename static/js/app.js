// Establish WebSocket connection with the server
const socket = io.connect("http://" + document.domain + ":" + location.port);

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
  mode: "python",
  lineNumbers: true,
  matchBrackets: true,
});

// Function to handle code changes and emit them to the server
function handleCodeChange(cm) {
  const code = cm.getValue(); // Get current code from editor
  socket.emit("code_change", code); // Send code to server via WebSocket
}

// Attach code change event listeners to the editor
editor.on("keyup", handleCodeChange);
editor.on("change", handleCodeChange);

function initializePanZoom() {
  const svgElement = document.querySelector("#output svg");
  if (svgElement) {
    svgPanZoom(svgElement, {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      zoomScaleSensitivity: 1,
      center: true,
    });
  } else {
    console.error("No SVG element found inside #output");
  }
}

// Handle the output from the server
socket.on("output", function (data) {
  document.getElementById("output").innerHTML = data.output;
  initializePanZoom();
});

// SVG icons
const sunIcon = "🌞"; // icon or svg string

const moonIcon = "🌜"; // icon or svg string

// Function to toggle dark mode
function toggleDarkMode() {
  const darkModeEnabled = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", darkModeEnabled);

  // Update toggle button icon
  document.getElementById("dark-mode-toggle").innerHTML = darkModeEnabled
    ? sunIcon
    : moonIcon;
}

// Initialize dark mode based on saved preference
function initializeDarkMode() {
  const darkModeEnabled = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", darkModeEnabled);
  document.getElementById("dark-mode-toggle").innerHTML = darkModeEnabled
    ? sunIcon
    : moonIcon;
}

// Handle Dark Mode toggle
document
  .getElementById("dark-mode-toggle")
  .addEventListener("click", toggleDarkMode);
initializeDarkMode();

// Handle file download
document.getElementById("download-file").addEventListener("click", function () {
  const code = editor.getValue(); // Get the current code from the editor
  const blob = new Blob([code], { type: "text/plain" }); // Create a Blob with the code content
  const a = document.createElement("a"); // Create an anchor element
  a.href = URL.createObjectURL(blob); // Create a downloadable object URL
  a.download = "code.py"; // Set the default file name
  a.click(); // Trigger the download
});

// Handle file upload
document.getElementById("upload-file").addEventListener("click", function () {
  document.getElementById("file").click(); // Programmatically trigger the file input click
});

// Handle file input (importing a Python file)
function loadFile(event) {
  const file = event.target.files[0]; // Get the selected file
  if (file && file.name.endsWith(".py")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      editor.setValue(e.target.result); // Load the content into the editor
    };
    reader.readAsText(file); // Read the file as text
  } else {
    alert("Please select a valid Python file (.py)");
  }

  // Clear the file input
  event.target.value = "";
}

// Attach the file input change event listener
document.getElementById("file").addEventListener("change", loadFile);

const separator = document.getElementById("separator");
const editorContainer = document.querySelector(".editor-container");
const outputContainer = document.querySelector(".output-container");

let isDragging = false;

separator.addEventListener("mousedown", function (e) {
  isDragging = true;
  document.body.style.cursor = "ew-resize";
});

document.addEventListener("mousemove", function (e) {
  if (!isDragging) return;

  const containerWidth = separator.parentElement.clientWidth;
  const editorWidth = e.clientX;
  const outputWidth = containerWidth - editorWidth;

  if (editorWidth < 50 || outputWidth < 50) return; // Minimum width check

  editorContainer.style.width = `${editorWidth}px`;
  outputContainer.style.width = `${outputWidth}px`;
});

document.addEventListener("mouseup", function () {
  isDragging = false;
  document.body.style.cursor = "default";
});

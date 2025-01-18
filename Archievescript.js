// Load tasks from local storage
function loadTasksFromLocalStorage() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  return storedTasks.map((task) => ({
    ...task,
    archived: task.archived || false,
    taskItems: task.taskItems.map((item) => {
      if (typeof item === "string") {
        return { description: item, completed: false }; // if the data is string format convert it into object
      }
      return item;
    }),
  }));
}

// Save  tasks to localstorage
function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(TaskArray));
}

// Initialize TaskArray from local storage
let TaskArray = loadTasksFromLocalStorage();

// Select necessary DOM elements
const CreateTaskBtn = document.getElementById("CreateTaskBtn");
const addItemBtn = document.getElementById("add-item-btn");
const CancelBtn = document.getElementById("cancel-btn");
const DisplayForm = document.getElementById("DisplayForm");
const DisplayAllTaskContainer = document.getElementById(
  "DisplayAllTaskContainer"
);
const ArchiveBtn = document.getElementById("Archive");

//  function to update the task display
function updateTaskDisplay(tasks) {
  DisplayAllTaskContainer.innerHTML = ""; // Clear existing tasks

  tasks.forEach((task) => {
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");

    // Task Title
    const taskTitleEl = document.createElement("p");
    taskTitleEl.classList.add("task-title");
    taskTitleEl.textContent = `Title: ${task.tasktitle}`;
    taskContainer.appendChild(taskTitleEl);

    // Task Due Date
    const taskDateEl = document.createElement("p");
    taskDateEl.classList.add("task-date");
    taskDateEl.textContent = `Due Date: ${task.taskdate}`;
    taskContainer.appendChild(taskDateEl);

    // Task Items
    const taskItemsContainer = document.createElement("ul");
    taskItemsContainer.classList.add("task-items-container");

    task.taskItems.forEach((item) => {
      const taskItem = document.createElement("li");
      taskItem.textContent = item.description;
      taskItem.classList.add("task-item");

      // Mark completed tasks
      if (item.completed) {
        taskItem.classList.add("completed");
      }

      taskItem.addEventListener("click", () => {
        item.completed = !item.completed; // Toggle completed state
        saveTasksToLocalStorage();
        taskItem.classList.toggle("completed");
      });

      taskItemsContainer.appendChild(taskItem);
    });

    taskContainer.appendChild(taskItemsContainer);

    // Archive or Unarchive Button
    const archiveBtn = document.createElement("button");
    archiveBtn.textContent = task.archived ? "Unarchive" : "Archive";
    archiveBtn.classList.add(task.archived ? "unarchive-btn" : "archive-btn");

    archiveBtn.addEventListener("click", () => {
      task.archived = !task.archived;
      saveTasksToLocalStorage();

      if (task.archived) {
        displayUnarchivedTasks();
      } else {
        displayArchivedTasks();
      }
    });

    taskContainer.appendChild(archiveBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      // Remove the specific task from TaskArray
      TaskArray = TaskArray.filter((t) => t !== task);
      saveTasksToLocalStorage();

      // Update the display
      if (task.archived) {
        displayArchivedTasks();
      } else {
        displayUnarchivedTasks();
      }
    });

    taskContainer.appendChild(deleteBtn);
    DisplayAllTaskContainer.appendChild(taskContainer);
  });
}

// Display unarchived tasks
function displayUnarchivedTasks() {
  const activeTasks = TaskArray.filter((task) => !task.archived);
  updateTaskDisplay(activeTasks);
}

// Display archived tasks only
function displayArchivedTasks() {
  const archivedTasks = TaskArray.filter((task) => task.archived);
  updateTaskDisplay(archivedTasks);
}

// Add new task item input
addItemBtn.addEventListener("click", () => {
  const inputDiv = document.createElement("div");
  inputDiv.classList.add("task-item");

  const label = document.createElement("label");
  label.textContent = "Task Description:";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "task-description";
  input.placeholder = "Enter task description";
  input.required = true;

  inputDiv.appendChild(label);
  inputDiv.appendChild(input);

  const taskInputContainer = document.getElementById("TaksInputContainer");

  taskInputContainer.appendChild(inputDiv);
});

// Cancel Button functionality to reset the form
CancelBtn.addEventListener("click", () => {
  const container = document.getElementById("TaksInputContainer");

  while (container.children.length > 1) container.lastChild.remove();

  DisplayForm.reset();
  DisplayForm.style.display = "none";
});

// When click on Create task Button show form
CreateTaskBtn.addEventListener(
  "click",
  () => (DisplayForm.style.display = "block")
);

// Submit Form
DisplayForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent Default Behaviour

  const formData = new FormData(DisplayForm);

  const newTask = {
    id: Date.now(), // Unique ID for each new task  (for task deletion)
    tasktitle: formData.get("task-title"),
    taskdate: formData.get("task-date"),
    archived: false,
    taskItems: formData.getAll("task-description").map((desc) => ({
      description: desc,
      completed: false,
    })),
  };

  TaskArray.push(newTask); // Add new task to TaskArray

  saveTasksToLocalStorage(); // Save updated tasks list to local storage

  displayUnarchivedTasks(); // Update Display Task Container

  CancelBtn.click(); // Reset the form
});

// Show archived tasks when Archive button is clicked in navbar
ArchiveBtn.addEventListener("click", () => displayArchivedTasks());

// Search Functionality
Search.addEventListener("click", () => {
  const CreateTaskBtnDiv = document.querySelector(".CreateTaskBtnDiv");
  CreateTaskBtnDiv.innerHTML = "";
  DisplayAllTaskContainer.innerHTML = "";
  ProfileModal.classList.add("hidden"); // Do not show the profile
  const input = document.createElement("input");
  input.placeholder = "Enter Date (yyyy-mm-dd)";
  input.id = "SearchInput";

  const button = document.createElement("button");
  button.textContent = "Search";
  button.id = "SearchBtn";

  CreateTaskBtnDiv.appendChild(input);
  CreateTaskBtnDiv.appendChild(button);

  button.addEventListener("click", () => {
    const searchDate = document.getElementById("SearchInput").value.trim();
    const filteredTasks = TaskArray.filter(
      (task) => task.taskdate === searchDate && !task.archived
    );

    if (filteredTasks.length > 0) {
      updateTaskDisplay(filteredTasks);
    } else {
      DisplayAllTaskContainer.innerHTML = `<p style="text-align: center;">No tasks found for ${searchDate}.</p>`;
    }
  });
});

// Display archived tasks
ArchiveBtn.addEventListener("click", () => {
  ProfileModal.classList.add("hidden");
  displayArchivedTasks();
});

// Profile Functionality
ProfileButton.addEventListener("click", () => {
  if (signedInUser) {
    UserName.textContent = `${signedInUser.Fname} ${signedInUser.Lname}`;
    UserEmail.textContent = signedInUser.Email;

    // remove Already present content
    DisplayAllTaskContainer.innerHTML = "";
    const CreateTaskBtnDiv = document.querySelector(".CreateTaskBtnDiv");
    CreateTaskBtnDiv.innerHTML = "";
    ProfileModal.classList.remove("hidden");
  }
});

CloseProfile.addEventListener("click", () => {
  ProfileModal.classList.add("hidden");
  window.location.href = "./Homepage.html";
});

LogoutBtn.addEventListener("click", () => {
  localStorage.removeItem("signedInUser");
  alert("Logged out successfully.");
  window.location.href = "./SignIn.html";
});

// Ensure the user is signed in
const signedInUser = JSON.parse(localStorage.getItem("signedInUser"));
if (!signedInUser) {
  alert("Please log in.");
  window.location.href = "./SignIn.html";
}

// Initialize tasks on page load
document.addEventListener("DOMContentLoaded", displayUnarchivedTasks);

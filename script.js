const itemInput = document.querySelector(".js-item");
const itemDate = document.querySelector(".js-item__date");
const saveBtn = document.querySelector(".js-add");
const listItem = document.querySelector(".task");

// Helper functions
const convertToDateTimeLocalString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const currentTime = new Date();
itemDate.min = convertToDateTimeLocalString(currentTime);

function calculateTimeDifference(endDate) {
  const diffMs = Math.abs(new Date(endDate).getTime() - new Date().getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes - days * 24 * 60 - hours * 60;
  if (minutes) return `${days} day(s) ${hours} hour(s) ${minutes} minute(s)`;
  else return `You have not chosen the deadline`;
}

// Functionality
function saveTodoItem() {
  let isFormValid = true;

  if (!itemInput.value.length > 0) {
    itemInput.classList.add("validation-error");
    isFormValid = false;
  } else {
    itemInput.classList.remove("validation-error");
  }

  if (isFormValid) {
    const todoItem = {
      todo: itemInput.value,
      deadline: calculateTimeDifference(itemDate.value),
    };

    const list = getTodoList();

    if (saveBtn.dataset.index) {
      list[saveBtn.dataset.index] = todoItem;
      delete saveBtn.dataset.index;
    } else {
      list.unshift(todoItem);
    }

    sessionStorage.todoList = JSON.stringify(list);
    itemInput.value = "";

    renderTable();
  }
}

function getTodoList() {
  let list;
  try {
    list = JSON.parse(sessionStorage.todoList);
  } catch {
    list = [];
  }
  return list;
}

saveBtn.addEventListener("click", function () {
  saveTodoItem();
});

function renderTable(checkbox = "", item) {
  const list = getTodoList();

  if (list.length > 0) {
    document.querySelector(".js-user-table-wrapper").style.display =
      "inline-table";
  }
  if (checkbox === "click" && !item) {
    const requiredElement = document.querySelector(".checked");
    document.querySelector(".js-user-table").appendChild(requiredElement);
  } else if (checkbox === "unclick" && !item && list.length === 0) {
    const requiredElement = document.querySelector(".checked");
    document.querySelector(".js-user-table").prepend(requiredElement);
  } else {
    document.querySelector(".js-user-table").innerHTML = "";

    list.forEach(function (user, index) {
      const tr = document.createElement("tr");
      tr.className = "row";
      const td1 = tr.appendChild(document.createElement("td"));
      td1.innerHTML = `${index + 1}`;
      const td2 = tr.appendChild(document.createElement("td"));
      td2.innerHTML = `${user.todo}`;
      const td3 = tr.appendChild(document.createElement("td"));
      td3.innerHTML = `${user.deadline}`;
      const td4 = tr.appendChild(document.createElement("td"));
      const btn = document.createElement("button");
      td4.appendChild(btn);
      btn.innerHTML = "Delete";
      btn.className = "js-delete";
      btn.setAttribute("data-index", index);
      const td5 = tr.appendChild(document.createElement("td"));
      const input = td5.appendChild(document.createElement("input"));
      td5.appendChild(input);
      input.className = "checkbox";
      input.setAttribute("type", "checkbox");
      input.setAttribute("data-index", index);
      const label = document.createElement("label");
      label.innerHTML = "Completed";
      document.querySelector(".js-user-table").appendChild(tr);
    });
  }

  document
    .querySelectorAll(".js-user-table .js-delete")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        const result = confirm("Want to delete?");
        if (result) {
          const list = getTodoList();
          list.splice(button.dataset.index, 1);
          sessionStorage.todoList = JSON.stringify(list);
          renderTable(false, true);
        }
      });
    });

  document.querySelectorAll(".checkbox").forEach(function (checkbox) {
    let list = getTodoList();
    checkbox.addEventListener("change", function (event) {
      event.preventDefault();
      if (checkbox.checked) {
        if (checkbox.closest(".row").classList.contains("checked")) {
          return;
        } else {
          checkbox.closest(".row").classList.add("checked");
        }

        list.push(list.splice(checkbox.dataset.index, 1)[0]);
        sessionStorage.todoList = JSON.stringify(list);
        renderTable("click", false);
      } else {
        checkbox.closest(".row").classList.remove("checked");
        list.unshift(list.splice(checkbox.dataset.index, 1)[0]);
        renderTable("unclick", false);
      }
    });
  });
}

const getCellValue = (tr, idx) =>
  tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) =>
  ((v1, v2) =>
    v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
      ? v1 - v2
      : v1.toString().localeCompare(v2))(
    getCellValue(asc ? a : b, idx),
    getCellValue(asc ? b : a, idx)
  );

document.querySelectorAll("th").forEach((th) =>
  th.addEventListener("click", () => {
    const table = th.closest("table");
    Array.from(table.querySelectorAll("tr:nth-child(n+2)"))
      .sort(
        comparer(
          Array.from(th.parentNode.children).indexOf(th),
          (this.asc = !this.asc)
        )
      )
      .forEach((tr) => table.appendChild(tr));
  })
);

addEventListener("DOMContentLoaded", (event) => {
  const list = [
    {
      todo: "play with kids",
      deadline: "1 day(s) 2 hour(s) 1 minute(s)",
    },
    {
      todo: "work on the project",
      deadline: "0 day(s) 2 hour(s) 1 minute(s)",
    },
    {
      todo: "run in the park",
      deadline: "3 day(s) 2 hour(s) 1 minute(s)",
    },
  ];
  sessionStorage.todoList = JSON.stringify(list);
  renderTable();
});

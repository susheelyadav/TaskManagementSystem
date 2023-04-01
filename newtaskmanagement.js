let arr = [];
let completedtask = [];
let isPopupVisible = false;

//To show a records after being refresh
if (localStorage.getItem("tasks")) {
    arr = JSON.parse(localStorage.getItem("tasks"));
    display();
}

//Update the kpi
window.onload = function () {
    if(localStorage.getItem("completetask")){
        completedtask = JSON.parse(localStorage.getItem("completetask"));
    }
    // console.log(completedtask.length);
    // console.log(arr.length);
    let total = completedtask.length + arr.length;
    document.getElementById("totaltask").innerHTML = total;
    document.getElementById("upcomingtasks").innerHTML = arr.length;
    document.getElementById("completedtasks").innerHTML = completedtask.length;
};

var tr;

//it get a values from form
function show() {
    let taskname = document.querySelector("#titleName").value;
    let date = document.querySelector("#date").value;
    let time = document.querySelector("#time").value;
    let tasktype = document.querySelector("#taskType").value;

    obj = {
        titleName: taskname,
        date: date,
        time: time,
        taskType: tasktype,
    };
    arr.push(obj);
    display();
    location.reload(); //it refresh a page
}

// it will display records and save it in local storage
function display() {
    localStorage.setItem("tasks", JSON.stringify(arr)); // first it stringify convert the arr into string and than store in browser
    document.getElementById("map1").innerHTML = null;
    arr.map((data, key) => {
        tr = document.createElement("tr");
        tr.innerHTML = `
    <td><input type="text" id="task1${key}" value="${data.titleName}"></td>
    <td><input type="date" id="date1${key}" value="${data.date}"></td>
    <td><input type="time" id="time1${key}" value="${data.time}"></td>
    <select id="taskType1${key}" >       
        <option  ${data.taskType == "" ? "selected" : ""
            } value="">--Select a task--</option>     
        <option  ${data.taskType == "task" ? "selected" : ""
            } value="task">Task</option>
        <option  ${data.taskType == "event" ? "selected" : ""
            } value="event">Event</option>
        <option  ${data.taskType == "meeting" ? "selected" : ""
            } value="meeting">Meeting</option>
    </select>
    <td><button onclick="del(${key})">Delete</button></td>
    <td><button onclick="edit(${key})">Update</button></td>
    `;
        document.getElementById("map1").appendChild(tr);
    });
}

//Delete a record
function del(k) {
    temp = [];
    arr.map((data, key) => {
        if (key != k) {
            temp.push(data);
        }
    });
    arr = temp;
    display();
    location.reload();
}

//To update a record
function edit(k) {
    console.log(k);
    temp = [];
    arr.map((data, key) => {
        if (key != k) {
            temp.push(data);
        } else {
            temp.push({
                titleName: document.getElementById("task1" + k).value,
                date: document.getElementById("date1" + k).value,
                time: document.getElementById("time1" + k).value,
                taskType: document.getElementById("taskType1" + k).value,
            });
        }
    });

    arr = temp;
    display();
}

//It clear the record from a browser storage
function clearrecord() {
    arr = [];
    localStorage.removeItem("tasks");
    completedtask = [];
    localStorage.removeItem("completetask");
    display();
    location.reload();
}

//TO SHOW THE POP UP AFTER TIME AND DATE OF TASK MATCH WITH CURRENT TIME AND DATE
let popupinterval;

//check arr and call the popup function
if (arr.length >= 1) {
    popup();
}

function popup() {
    popupinterval = setInterval(popsetinterval, 1000);
}

function popsetinterval() {
    if (isPopupVisible) {
        return; // skip if popup is already visible
    }
    arr.map((data, key) => {
        let date = data.date;
        let time = data.time;
        let total = date + " " + time;
        let targetDateTime = Date.parse(total);
        let currentdate = new Date();
        if (currentdate >= targetDateTime) {
            showpopup(data.titleName, date, time, key); // it show popup
            const taskcompletedbutton = document.getElementById("taskcompleted");
            taskcompletedbutton.onclick = function () {
                hidepop(key, data); // it hide the pop up and delete a task
            };
            const taskedit = document.getElementById("taskdelay");
            taskedit.onclick = function () {
                editpop(data, key); // it will edit task time and date
            };
        }
    });
}

function showpopup(title, date, time, key) {
    isPopupVisible = true;
    document.getElementById("alertbox").style.display = "block";
    document.querySelector(".alertboxoverlay").style.display = "block";
    let div = document.createElement("div");
    div.innerHTML = `<h3>Alert</h3>
    <p>Task: ${title.charAt(0).toUpperCase() + title.slice(1)}</p>
    <div id="datetime">
        <span>Task Time: ${time}</span>
        <span>Task Date: ${date}</span>
    </div>
    <input type="button"  value="Task completed"  id="taskcompleted" class="btn">
    <input type="button" value ="Task delay"  id="taskdelay" class="btn" >
    `;
    document.getElementById("alertbox").innerHTML = null;
    document.getElementById("alertbox").appendChild(div);
    playaudio();
}

function hidepop(key, data) {
    stopaudio();
    isPopupVisible = false;
    document.getElementById("alertbox").style.display = "none";
    document.querySelector(".alertboxoverlay").style.display = "none";
    completedtask.push(data.date);
    localStorage.setItem("completetask", JSON.stringify(completedtask));
    del(key);
}

function editpop(data, key) {
    stopaudio();
    document.getElementById("alertbox").style.display = "none";

    clearInterval(popupinterval); // stop the interval
    let div1 = document.createElement("div");
    div1.innerHTML = `<h3>Task Delay</h3>
        <div id="datetime2">
        <span>Date:<input type="date"  id="date2${key}" value="${data.date}"></input></span>
        <span>Time:<input type="time" id="time2${key}" value="${data.time}"></input></span>
        <div>
        <input type="button"   id="submit" class="btn btn-new" value="submit" >
        `;
    document.getElementById("timechange").innerHTML = null;
    document.getElementById("timechange").appendChild(div1);
    document.getElementById("timechange").style.display = "block";

    const submitButton = document.getElementById("submit");
    submitButton.addEventListener("click", function () {
        edittime(key);
        isPopupVisible = false;
        document.getElementById("timechange").style.display = "none";
        document.querySelector(".alertboxoverlay").style.display = "none";
        popupinterval = setInterval(popsetinterval, 1000); //it start the setinterval
    });
}

//it will get value from inputs and save into a deskstop browser
function edittime(key) {
    arr[key].date = document.getElementById("date2" + key).value;
    arr[key].time = document.getElementById("time2" + key).value;
    display();
}

//audio
function playaudio() {
    var audio = document.getElementById("myAudio");
    audio.play();
}

function stopaudio() {
    var audio = document.getElementById("myAudio");
    audio.pause();
}

// it is for the search of tasks
const inputsearch = document.getElementById("search");
const row = document.getElementById("map1");

inputsearch.addEventListener("input", function () {
    searchtext = inputsearch.value.toLowerCase();
    console.log(searchtext);

    arr.map((data, key) => {
        obtainvalue = data.titleName.toLowerCase();

        if (obtainvalue.includes(searchtext)) {
            document.getElementById(
                `task1${key}`
            ).parentNode.parentNode.style.display = "table-row";
        } else {
            document.getElementById(
                `task1${key}`
            ).parentNode.parentNode.style.display = "none";
        }
    });
});

//eventlistender for sorting:
sortdatename = document.getElementById("sortdatename");
sortdatename.addEventListener("change", () => {
    if (sortdatename.value == "Date") {
        sortbydate();
    } else if (sortdatename.value == "Name") {
        sortbyname();
    }
});

//it for sorting of tasks by date and time
function sortbydate() {
    let sorteddate = arr.sort((a, b) => {
        let datecompareA = `${a.date}${a.time}`;
        let datecompateB = `${b.date}${b.time}`;
        return datecompareA.localeCompare(datecompateB);
    });
    arr = sorteddate;
    display();
}

//sorting by name
function sortbyname() {
    let sortname = arr.sort((a, b) => a.titleName.localeCompare(b.titleName));
    arr = sortname;
    display();
}

//for filtering of tasks by tasktype
function filterfunction() {
    filtervalue = document.getElementById("taskTypefilter").value;

    arr.map((data, key) => {
        obtainvalue = data.taskType.toLowerCase();

        if (obtainvalue.includes(filtervalue)) {
            document.getElementById(
                `task1${key}`
            ).parentNode.parentNode.style.display = "table-row";
        } else {
            document.getElementById(
                `task1${key}`
            ).parentNode.parentNode.style.display = "none";
        }
    });
}

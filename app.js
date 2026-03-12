// ===============================
// CONFIG
// ===============================

const API_BASE = "https://pipelineforge.onrender.com/api"

// ===============================
// STORAGE
// ===============================

let industries = JSON.parse(localStorage.getItem("industries")) || [
"Logistics",
"Construction",
"Manufacturing",
"Real Estate",
"Consulting",
"IT Services"
]

let tracker = JSON.parse(localStorage.getItem("tracker")) || []
let template = JSON.parse(localStorage.getItem("template")) || {}


// ===============================
// ELEMENTS
// ===============================

const industrySelect = document.getElementById("industrySelect")
const searchIndustry = document.getElementById("searchIndustry")
const newIndustry = document.getElementById("newIndustry")
const addIndustryBtn = document.getElementById("addIndustryBtn")

const defaultLocationInput = document.getElementById("defaultLocation")

const subjectInput = document.getElementById("subject")
const messageInput = document.getElementById("message")

const resultsTable = document.querySelector("#resultsTable tbody")
const trackerTable = document.querySelector("#trackerTable tbody")

const notificationList = document.getElementById("notifications")
const popup = document.getElementById("popupReminder")


// ===============================
// SAVE FUNCTIONS
// ===============================

function saveIndustries(){
localStorage.setItem("industries",JSON.stringify(industries))
}

function saveTracker(){
localStorage.setItem("tracker",JSON.stringify(tracker))
}

function saveTemplate(){
localStorage.setItem("template",JSON.stringify(template))
}


// ===============================
// RENDER INDUSTRIES
// ===============================

function renderIndustries(){

industrySelect.innerHTML=""
searchIndustry.innerHTML=""

industries.forEach(ind=>{

let opt1=document.createElement("option")
opt1.value=ind
opt1.textContent=ind

let opt2=opt1.cloneNode(true)

industrySelect.appendChild(opt1)
searchIndustry.appendChild(opt2)

})

}


// ===============================
// ADD INDUSTRY
// ===============================

addIndustryBtn.onclick=function(){

let name=newIndustry.value.trim()
if(!name) return

industries.push(name)

saveIndustries()
renderIndustries()

newIndustry.value=""

}


// ===============================
// DEFAULT LOCATION
// ===============================

defaultLocationInput.value =
localStorage.getItem("defaultLocation") || ""

defaultLocationInput.addEventListener("change",()=>{

localStorage.setItem(
"defaultLocation",
defaultLocationInput.value
)

})


// ===============================
// MESSAGE TEMPLATE
// ===============================

subjectInput.value = template.subject || ""
messageInput.value = template.message || ""

document.getElementById("saveTemplate").onclick=function(){

template.subject=subjectInput.value
template.message=messageInput.value

saveTemplate()

alert("Template saved")

}


// ===============================
// BUSINESS DISCOVERY
// ===============================

document.getElementById("findBusinesses").onclick=function(){

let industry=searchIndustry.value
let city=document.getElementById("searchLocation").value

if(!city){
alert("Enter a city")
return
}

discoverBusinesses(industry,city)

}


async function discoverBusinesses(industry,city){

resultsTable.innerHTML="<tr><td colspan='5'>Searching businesses...</td></tr>"

try{

const res = await fetch(
`${API_BASE}/search?industry=${encodeURIComponent(industry)}&city=${encodeURIComponent(city)}`
)

const businesses = await res.json()

renderDiscoveredBusinesses(businesses,industry,city)

}catch(err){

resultsTable.innerHTML="<tr><td colspan='5'>Failed to fetch businesses</td></tr>"

}

}


// ===============================
// RENDER DISCOVERED BUSINESSES
// ===============================

function renderDiscoveredBusinesses(list,industry,city){

resultsTable.innerHTML=""

if(!list.length){

resultsTable.innerHTML="<tr><td colspan='5'>No businesses found</td></tr>"
return

}

list.forEach(b=>{

let row=document.createElement("tr")

row.innerHTML=`

<td>${b.name || "-"}</td>
<td>${b.email || "-"}</td>
<td>${b.phone || "-"}</td>
<td><a href="${b.website}" target="_blank">${b.website || "-"}</a></td>

<td>

<button onclick="sendToTracker('${b.name}','${industry}','${city}','${b.email}')">
Add
</button>

<button onclick="quickOutreach('${b.name}','${b.email}','${b.phone}')">
Send
</button>

</td>
`

resultsTable.appendChild(row)

})

}


// ===============================
// ADD TO TRACKER
// ===============================

function sendToTracker(name,industry,location,contact){

let entry={

name,
industry,
location,
contact,
platform:"Email",
status:"Message Sent",
followup:Date.now()+86400000

}

tracker.unshift(entry)

saveTracker()
renderTracker()

}


// ===============================
// TRACKER TABLE
// ===============================

function renderTracker(){

trackerTable.innerHTML=""

tracker.forEach((lead,index)=>{

let remaining=lead.followup-Date.now()
let minutes=Math.floor(remaining/60000)

let timerText = minutes>0 ? minutes+"m" : "Due"

let row=document.createElement("tr")

row.innerHTML=`

<td>${lead.name}</td>
<td>${lead.industry}</td>
<td>${lead.location}</td>
<td>${lead.contact}</td>
<td>${lead.platform}</td>
<td>${lead.status}</td>
<td>${new Date(lead.followup).toLocaleString()}</td>
<td>${timerText}</td>

<td>
<button onclick="editStatus(${index})">Edit</button>
<button onclick="deleteLead(${index})">Delete</button>
</td>

`

trackerTable.appendChild(row)

})

}


// ===============================
// DELETE LEAD
// ===============================

function deleteLead(i){

tracker.splice(i,1)

saveTracker()
renderTracker()

}


// ===============================
// EDIT STATUS
// ===============================

function editStatus(i){

let newStatus=prompt("Update status",tracker[i].status)

if(!newStatus) return

tracker[i].status=newStatus

saveTracker()
renderTracker()

}


// ===============================
// QUICK OUTREACH
// ===============================

function quickOutreach(name,email,phone){

let subject=encodeURIComponent(template.subject || "Quick question")
let message=encodeURIComponent(template.message || "Hello, I wanted to reach out.")

if(email){

let emailLink=`mailto:${email}?subject=${subject}&body=${message}`
window.open(emailLink)

}

if(phone){

let number=phone.replace(/\D/g,'')

let whatsapp=`https://wa.me/${number}?text=${message}`
window.open(whatsapp)

}

}


// ===============================
// REMINDER SYSTEM
// ===============================

function checkReminders(){

notificationList.innerHTML=""

tracker.forEach(lead=>{

let diff=lead.followup-Date.now()
let minutes=Math.floor(diff/60000)

if(minutes<=60 && minutes>0){

let li=document.createElement("li")
li.textContent=`Follow up with ${lead.name} in ${minutes} minutes`

notificationList.appendChild(li)

}

if(minutes<=15 && minutes>0){
popup.style.display="block"
}

})

}


// ===============================
// POPUP CLOSE
// ===============================

document.getElementById("dismissPopup").onclick=function(){

popup.style.display="none"

}


// ===============================
// TIMER LOOP
// ===============================

setInterval(()=>{

checkReminders()
renderTracker()

},60000)


// ===============================
// INIT
// ===============================

renderIndustries()
renderTracker()
checkReminders()
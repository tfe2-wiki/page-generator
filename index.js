const fs = require('fs')
const path = require('path')

// parse a language csv file
function parseLanguageFile(file) {
	let lines = fs.readFileSync(file, 'utf8').split('\n')
	let lang = {}
	for (let line of lines) {
		let parts = line.split('|')
		if (parts.length == 2) {
			lang[parts[0]] = parts[1]
		}
	}
	return lang
}

// parse an info file
// info files contains key/value pairs separated by '||' on its own line
// keys and values are separated by a single line
function parseInfoFile(file) {
	let pairs = fs.readFileSync(file, 'utf8').split('\n||\n')
	let info = {}
	for (let pair of pairs) {
		let parts = pair.split('\n')
		info[parts.shift()] = parts.join('\n')
	}
	return info
}

function writePages(path) {
	// for each page in pages object, write it to the file system
	// get page key as well
	for (const [key, value] of Object.entries(pages)) {
		console.log('writing page ' + key)
		fs.writeFileSync("./pages/"+path+"/"+key+".md", value, 'utf8')
		// remove the page from the pages object
		delete pages[key]
	}
}

const en = parseLanguageFile('./files/lang_en.csv')
const buildinginfo = require('./files/buildinginfo.json')
const buildingUpgradesInfo = require('./files/buildingUpgradesInfo.json')
const buildingCategoriesInfo = require('./files/buildingCategoriesInfo.json')
const buildableWorldResourcesInfo = require('./files/buildableWorldResourcesInfo.json')
const bridgesInfo = require('./files/bridgesInfo.json')
const cityUpgradesInfo = require('./files/cityUpgradesInfo.json')
const decorationsInfo = require('./files/decorationsInfo.json')
const stories = require('./files/stories.json')

const buildings = parseInfoFile('./buildings.info', 'utf8')

var pages = {}

// loop through buildinginfo.json and generate markup pages
// each building has a name and description in the language file
// the class name is used as the filename
// buildinginfo.json/BuildingClass.name
// buildinginfo.json/BuildingClass.description
console.info("Generating building pages...")
fs.mkdirSync('./pages/buildings', { recursive: true })
buildinginfo.forEach(function(building) {
	let name = en["buildinginfo.json/" + building.className + ".name"]
	console.log("Generating page for " + building.className + ": " + name)
	// remove last instance of newline
	let description = (en["buildinginfo.json/" + building.className + ".description"] || "No description provided\n").replace(/\n$/, "")
	let costlist = {}
	if (building.food) costlist["Food"] = building.food
	if (building.wood) costlist["Wood"] = building.wood
	if (building.stone) costlist["Stone"] = building.stone
	if (building.machineParts) costlist["Machine Parts"] = building.machineParts
	if (building.refinedMetal) costlist["Refined Metal"] = building.refinedMetal
	if (building.computerChips) costlist["Computer Chips"] = building.computerChips
	if (building.graphene) costlist["Graphene"] = building.graphene
	if (building.rocketFuel) costlist["Rocket Fuel"] = building.rocketFuel
	// turn costlist into array of strings in format of "Count Resource"
	let costlistArray = []
	for (let resource in costlist) {
		costlistArray.push(costlist[resource] + " " + resource)
	}
	let capacity = []
	if (building.residents) capacity.push(building.residents + " Residents")
	if (building.jobs) capacity.push(building.jobs + " Jobs")
	// capitalize specialInfo phrases
	let specialInfo = building.specialInfo
	specialInfo.forEach(function(phrase) {
		phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1)
	})
	let page = 
`---
title: ${name}
parent: Buildings
---
# ${name}

<table>
<thead>
	<tr>
	<th>Cost</th>
	<th>Capacity</th>
	${building.quality ? `<th>
		Quality
	</th>` : ""}
	<th>Research Cost</th>
	<th>Category</th>
	</tr>
</thead>
<tbody>
	<tr>
	<td>
		${costlistArray.join('<br>')}
	</td>
	<td>
		${capacity.join('<br>')}
	</td>
	${building.quality ? `<td>
		${building.quality}
	</td>` : ""}
	<td>
		${building.knowledge ? building.knowledge : "None"}
	</td>
	<td>
		${building.category}
	</td>
	</tr>
</tbody>
</table>

> *"${description}"*

manual description, including links to upgrade pages, how to unlock, etc
`
	pages[building.className] = page
})

console.info("Writing building pages...")
writePages("buildings")
//This is called from the searchMonsterData function 
function getData(url, cb) {
    var xhr = new XMLHttpRequest();

    //we set onredystatechange to an anon function which tests the status of the data from the API
    xhr.onreadystatechange = function () {
        //if the ready state is 4 and the status is 200
        if (this.readyState == 4 && this.status == 200) {
            //we call our callback function in the getData call and parse is as JSON data. The data held in this.responseText
            //(xhr.responseText) is passed back into the the searchMonsterData function.
            //console.log(xhr.responseText);
            cb(JSON.parse(this.responseText));
        }
    };

    xhr.open("GET", url);
    xhr.send();

}

// A quick snippet of text so pressing enter triggers the search box
$(document).ready(function () {
    $('#monsterName').keypress(function (e) {
        if (e.keyCode == 13)
            $('#search-button').click();
    });
});

// this variable is used for the displaySelection() function to know which layout to render
var searchType;
url = 'http://www.dnd5eapi.co/api/monsters';

//set the searchType variable and set the url to point to monsters or spells with the select box
function categorySelect() {
    var category = document.getElementById("category-dropdown").value;
    if (category == "spell") {
        url = 'http://www.dnd5eapi.co/api/spells';
        searchType = 'spells';

        console.log(searchType);
    } else {
        url = 'http://www.dnd5eapi.co/api/monsters';
        searchType = 'monsters';
    }
}

function searchMonsterData() {

    var search = document.getElementById("monsterName").value;

    //Capitalise each word in the seach term, so that it matches the data
    function titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
    }


    var searchTerm = titleCase(search);
    var monsterData;
    var result;
    var monsterURL;
    var reg = new RegExp(searchTerm.split('').join('\\w*').replace(/\W/, ""), 'i');

    //call the get data function and give it the url 
    getData(url, function (data) {

        //monster data is an array of key value objects with the name and url for each monster
        monsterData = data.results;
        console.log(monsterData);

        //here we use our regex to match the search string to names of monsters and return matching elements
        result = monsterData.filter(function (element) {
            if (element.name.match(reg)) {
                return element;
            }
        });

        //we have found corresponding elements
        if (result.length > 0) {
            //create a new variable for our result array. It contains an array of name url key value pairs for monsters that match
            //our search
            resultArr = result;
            //console.log(resultArr);
            //this takes the url of the first result and puts it in the monsterURL variable
            // *** This is a problem because we actuall want the url for each returned monster ***
            monsterURL = resultArr[0].url;
            //console.log(monsterURL);
        }

        //we call getData again, this time to return the data for an individual monster
        // *** this needs to change to take multiple urls and 
        getData(monsterURL, function (data) {

            //console.log(monsterArr);
            console.log(resultArr);

            //create an array containing the URLS from resultArr
            function listOfURLS(mons) {
                let URL_list = [];
                for (let i = 0; i < mons.length; i += 1) {
                    URL_list.push(mons[i].url);
                }
                return URL_list;
            }

            //console.log(listOfURLS(resultArr));

            displayMonster(resultArr, listOfURLS(resultArr));
        })
    })
}

//getTableHeaders takes an object as a parameter, in this case it is the first result returned in our data array which contains
//an object with two key, value pairs. The keys are name and url. Which will be our table headers
function getTableHeaders(obj) {
    //create a new array to hold out table headers
    var tableHeaders = [];

    var keys = Object.keys(obj)[0];
    console.log(keys);

    //for each key in our object 
    //Object.keys(obj).forEach(function (key) {
    //push the html tags enclosing the value of our key
    tableHeaders.push(`<td>${keys}</td>`);
    //});
    //return the tableHeaders array, further encapsulated in <tr> tags.
    return `<tr>${tableHeaders}</tr>`;
}

function displayMonster(resultArr, monsterURLList) {

    //declare a new variable containing an empty array for our table rows
    //var tableRows = [];
    var newArray = [];
    var counter = 0;
    //for each url in monsterURLList

    for (let i = 0; i < monsterURLList.length; i += 1) {
        //call getData for url and get data back
        getData(monsterURLList[i], function (data) {

            //add data to newArray 
            newArray.push(data);
            //increment counter each time newArray is pushed
            counter++;
            //when it has been pushed for each url
            if (counter === monsterURLList.length) {
                //call build tables and pass it out newArray
                //buildTables(newArray);
                populateResults(newArray);
            }
            dataList = newArray;

        })
    }
}

//combinedArray is the result of code to this point. It is an array of objects containing monster data for each of the 
//monsters that matched our search term.
//populate results takes 
function populateResults(combinedArray) {

    console.log(combinedArray);
    /*var select = document.getElementById("example-select");
     select.options[select.options.length] = new Option('Text 1', 'Value1');
    */
    //https://www.electrictoolbox.com/javascript-add-options-html-select/

    var select = document.getElementById("selector");
    select.style.display = "block";
    //make sure the list is clear first
    removeOptions(select);

    //for each object in combinedArray create a new list item object with index.name and index as args
    for (index in combinedArray) {
        console.log(select.options.length);
        select.options[select.options.length] = new Option(combinedArray[index].name, index);
    }
}

var dataList = [];

//here we have function to interate through out dropdown HTML element and remove the contents.
function removeOptions(selectbox) {

    var i;
    for (i = selectbox.options.length - 1; i >= 0; i--) {
        selectbox.remove(i);
    }
}

var capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

var monster;

function displaySelection(selector) {
    var selectedText = selector.options[selector.selectedIndex].innerHTML;
    var selectedValue = selector.value;
    monster = dataList[selectedValue];

    function createMonsterLayout() {

        //clear card first and then dynamically create the elements needed.
        $(".card").empty();

        var newSpan = $('<span/>', {
            'class': 'card-heading',
            id: 'monster-name'
        });

        var featureBlock1 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'feature-block1'
        });

        var featureBlock2 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'feature-block2'
        });

        var cvsAnchor = $('<div/>', {
            'class': 'cvs-anchor col-xs-12 col-sm-12 col-md-12 col-lg-12',
            id: 'cvs-anchor'
        });

        var newCanvas = $('<canvas/>', {
            'class': 'graphCanvas',
            id: 'cvs'
        }).prop({
            width: 400,
            height: 280

        });

        var statDiv3 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'more-stats1'
        });

        var statDiv4 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'more-stats2'
        });

        $('.card').append(newSpan);
        $('.card').append(featureBlock1);
        $('.card').append(featureBlock2);
        $('.card').append(cvsAnchor);
        $('#cvs-anchor').append(newCanvas);
        $('.card').append(statDiv3);
        $('.card').append(statDiv4);

        //if the monster has extra actions, create a div.
        if (monster.actions) {
            var actionsDiv = $('<div/>', {
                'class': 'actions',
                id: 'action-div'
            });

            //append our new action-div to .card
            $('.card').append(actionsDiv);

            //begin appending data for monster actions
            $('#action-div').append(`<span><h5>Actions: </h5></span>`);

            //create a new array
            var actionsArr = [];
            //fill the actionsArr with the actions available to the monster
            for (let i = 0; i <= monster.actions.length - 1; i++) {
                actionsArr.push(monster.actions[i]);
            }
            //console.log(actionsArr);

            //for each action in actionsArr
            for (let j = 0; j <= actionsArr.length - 1; j++) {                

                //append name, bonuses and description
                $("#action-div").append(`<p><b>${actionsArr[j].name}</b><br />`);
                
                //if attack_bonus exists and isn't 0, append it.
                if (actionsArr[j].attack_bonus) {
                    if (actionsArr[j].attack_bonus != 0) {
                        $("#action-div").append(`<b>Attack bonus: </b>${actionsArr[j].attack_bonus}<br />`);
                    } 
                }               

                //if damage_bonus exists and isn't 0, append it along with damage dice.
                if (actionsArr[j].damage_bonus) {
                    if (actionsArr[j].damage_bonus != 0) {
                        $("#action-div").append(`<b>Damage bonus: </b>${actionsArr[j].damage_bonus} <br /> 
                        <b>Damage dice: </b>${actionsArr[j].damage_dice}<br />`);
                    }
                }

                $("#action-div").append(`<b>Description: </b>${actionsArr[j].desc}</p>`);                   
            }
        }

        //if the monster has special abilities, create a div
        if (monster.special_abilities) {
            var abilitiesDiv = $('<div/>', {
                'class': 'special-abilities',
                id: 'ability-div'
            });

            //append out new ability-div to .card
            $('.card').append(abilitiesDiv);

            //begin appending data for monster abilities
            $('#ability-div').append(`<span><h5>Special Abilities: </h5></span>`);
            
            //create a new array
            var abilitiesArr = [];
            
            //push the monsters abilities to abilitiesArr
            for (let i = 0; i <= monster.special_abilities.length - 1; i++) {
                abilitiesArr.push(monster.special_abilities[i]);
            }
            //console.log(abilitiesArr);           
            
            //for each ability in abilitiesArr
            for (let j = 0; j <= abilitiesArr.length - 1; j++) {

                //if attack_bonus exits and isn't equal to 0, append it.
                if (abilitiesArr[j].attack_bonus) {
                    if (abilitiesArr[j].attack_bonus != 0) {
                        $("#ability-div").append(`<b>Attack bonus:</b> ${abilitiesArr[j].attack_bonus}<br />`);
                    }
                }

                //append ability name and description
                $("#ability-div").append(`<p><b>${abilitiesArr[j].name}</b><br /> ${abilitiesArr[j].desc}</p>`);
            }

        }

        function printMonsterCard() {

            //add more general monster stats and info to the card.           
            $("#monster-name").append(`<h2>${monster.name}</h2>`);
            $("#feature-block1").append(`<b>Alignment:</b> ${capitalize(monster.alignment)}<br />`);
            $("#feature-block1").append(`<span id="type-span"><b>Type:</b> ${capitalize(monster.type)} </span><br />`);
            if (monster.subtype != "") {
                $("#type-span").append(`(<b>Subtype: </b>${capitalize(monster.subtype)})`);
            }

            $("#feature-block1").append(`<b>Size:</b> ${capitalize(monster.size)}<br />`);
            $("#feature-block1").append(`<b>Speed: </b>${capitalize(monster.speed)}<br />`);

            $("#feature-block2").append(`<b>Challenge rating:</b> ${monster.challenge_rating}<br />`);
            $("#feature-block2").append(`<b>Hit points:</b> ${monster.hit_points}<br />`);
            $("#feature-block2").append(`<b>Armor Class:</b> ${monster.armor_class}<br />`);
            if (monster.stealth != 0) {
                $("#feature-block2").append(`<b>Stealth:</b> ${monster.stealth}<br />`);
            }
            
            $("#more-stats1").append(`<b>Languages:</b> ${capitalize(monster.languages)}<br />`);
            $("#more-stats1").append(`<b>Senses: </b>${capitalize(monster.senses)}<br />`);



            if (monster.condition_immunities != "") {
                $("#more-stats2").append(`<b>Condition Immunities:</b> ${capitalize(monster.condition_immunities)} <br />`);
            }

            if (monster.damage_immunities != "") {
                $("#more-stats2").append(`<b>Damage Immunities:</b> ${capitalize(monster.damage_immunities)} <br />`);
            }

            if (monster.damage_resistances != "") {
                $("#more-stats2").append(`<b>Damage Resistances:</b> ${capitalize(monster.damage_resistances)} <br />`);
            }

            if (monster.damage_vulnerabilities != "") {
                $("#more-stats2").append(`<b>Damage Vulnerabilities:</b> ${capitalize(monster.damage_vulnerabilities)} <br />`);
            }

            if ('charisma_save' in monster) {
                $("#more-stats2").append(`<b>Charisma Save:</b> +${monster.charisma_save}<br />`);
            }
            if ('wisdom_save' in monster) {
                $("#more-stats2").append(`<b>Wisdom Save:</b> +${monster.wisdom_save}<br />`);
            }
            if ('constitution_save' in monster) {
                $("#more-stats2").append(`<b>Constitution Save:</b> +${monster.constitution_save}<br />`);
            }
            if ('dexterity_save' in monster) {
                $("#more-stats2").append(`<b>Dexterity Save:</b> +${monster.dexterity_save}<br />`);
            }
            if ('strength_save' in monster) {
                $("#more-stats2").append(`<b>Strength Save:</b> +${monster.strength_save}<br />`);
            }
            if ('intelligence_save' in monster) {
                $("#more-stats2").append(`<b>Intelligence Save:</b> +${monster.intelligence_save}<br />`);
            }
        }

        printMonsterCard();
        statSpiderGraph();

    }

    function createSpellLayout() {

        usedByClasses = [];

        for (let i = 0; i <= monster.classes.length - 1; i++) {
            usedByClasses.push(monster.classes[i].name);
        };

        descriptionList = [];

        for (let i = 0; i <= monster.desc.length - 1; i++) {
            descriptionList.push(monster.desc[i]);
        };

        console.log(descriptionList.join(" "));


        //console.log(usedByClassesList);


        //clear card first and then dynamically create the elements needed.
        $(".card").empty();

        var statBackground = $('<div/>', {
            'class': 'background',
            id: 'stat-background'
        });

        var titleSpan = $('<span/>', {
            'class': 'card-heading',
            id: 'spell-name'
        });

        var featureBlock1 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'feature-block1'
        });

        var featureBlock2 = $('<div/>', {
            'class': 'feature-block col-xs-6 col-sm-6 col-md-6 col-lg-6',
            id: 'feature-block2'
        });

        var statDiv3 = $('<div/>', {
            'class': 'feature-block',
            id: 'class-can-use'
        });

        var statDiv4 = $('<div/>', {
            'class': 'description-block',
            id: 'spell-description'
        });

        $('.card').append(titleSpan);
        $('.card').append(statBackground);

        $('#stat-background').append(featureBlock1);
        $('#stat-background').append(featureBlock2);
        $('.card').append(statDiv3);
        $('.card').append(statDiv4);


        //var selectedText = selector.options[selector.selectedIndex].innerHTML;
        //var selectedValue = selector.value;

        function printCard() {

            //


            $("#spell-name").append(`<h2>${monster.name}</h2>`);
            $("#feature-block1").append(`<b>Level:</b> ${monster.level}<br />`);
            $("#feature-block1").append(`<b>Range:</b> ${monster.range}<br />`);
            $("#feature-block1").append(`<b>Duration:</b> ${monster.duration}<br />`);
            $("#feature-block1").append(`<b>Components:</b> ${monster.components}<br />`);

            if (monster.material) {
                $("#feature-block1").append(`<b>Material:</b> ${monster.material} <br />`);
            }

            $("#feature-block2").append(`<b>School:</b> ${monster.school.name}<br />`);
            $("#feature-block2").append(`<b>Casting time</b>: ${monster.casting_time}<br />`);
            $("#feature-block2").append(`<b>Concentration:</b> ${monster.concentration} <br />`);
            $("#feature-block2").append(`<b>Ritual:</b> ${monster.ritual}<br />`);

            $("#class-can-use").append(`<b>Classes:</b> ${usedByClasses.join(", ")}<br />`);

            $("#spell-description").append(`<b>Description:</b> <p>${descriptionList.join(" ")}</p><br />`);

        }

        printCard();

    }

    var draw = function () {
        if (searchType == "spells") {
            createSpellLayout();
        } else {
            createMonsterLayout();
        }
    }();



}
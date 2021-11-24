const characterShortNames = ['SOL', 'KYK', 'MAY', 'AXL', 'CHP', 'POT', 'FAU', 'MLL', 'ZAT', 'RAM', 'LEO', 'NAG', 'GIO', 'ANJ', 'INO', 'GLD', 'JKO'];

const stories = [
]

const storyData = new Vue({
    el: "#page",
    data: { stories, activeStoryIndex: -1, showStory: false }
})
window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const profileURL = urlParams.get('openid.identity');
    let accountID = null
    if (profileURL) {
        accountID = profileURL.split('/').slice(-1)[0]
        console.log(accountID)
    }
    storyData.showStory = profileURL;
    storyData.showButton = !profileURL ? '' : 'none';

    let userDetails = null;
    if (profileURL) {
        userDetails = await getUserDetails(accountID);
        const userStats = await getUserStats(userDetails.UserID);
        console.log(userDetails);
        console.log(userStats);
        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `Your most played character is ${getPlayerMain(userStats)}`
        });
        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `You've played ${getNumGamesPlayed(userStats)} ranked games to date`
        });
        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `You've spent ${getPlayTime(userStats)} hours of your life playing Guilty Gear Strive`
        });
        
    }
    
    storyData.activeStoryIndex = 0;
    goToStory(storyData.activeStoryIndex % stories.length);
    setInterval(function () {
        storyData.activeStoryIndex += 1;
        storyData.activeStoryIndex %= stories.length
        goToStory(storyData.activeStoryIndex % stories.length);
    }, 3000);

};

function hexEncode(string) {
    var hex, i;

    var result = "";
    for (i = 0; i < string.length; i++) {
        hex = string.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-2);
    }

    return result
}

function getPlayerMain(userStats) {
    let highestLevelCharacter = '';
    let highestCharacterLevel = 0;
    for (let i = 0; i < characterShortNames.length; i++) {
        const character = characterShortNames[i];
        const characterLevel = userStats[character + '_Lv']
        if (characterLevel > highestCharacterLevel) {
            highestLevelCharacter = character;
            highestCharacterLevel = characterLevel;
        }
    }

    return highestLevelCharacter;
}

function getNumGamesPlayed(userStats) {
    return userStats.TotalRankMatch
}

function getPlayTime(userStats) {
    return (userStats.TotalPlayTime/3600/60).toFixed(2)
}
function goToStory(n) {
    const img = document.getElementById('story-image');
    const text = document.getElementById('story-text');
    img.src = stories[n].img;
    text.innerText = stories[n].text;
}

async function getUserDetails(accountID) {
    try {
        const userDetails = await fetch(`https://ggst-utils-default-rtdb.europe-west1.firebasedatabase.app/${accountID}.json`, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return userDetails.json();
    } catch (error) {
        console.log('Couldn\'t get details for user with accountID', accountID,)
        throw error;
    }
}

async function getUserStats(userID) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("data", "9295b2323131303237313133313233303038333834ad3631393064363236383739373702a5302e302e370396b2"+ hexEncode(userID) + "070101ffffff");
    // "9295b2323131303237313133313233303038333834ad3631393064363236383739373702a5302e302e370396b2" + userID + "0101ffffff"
    
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
        mode: 'cors'
    };

    try {
        const response = await fetch("https://ggst-api-proxy.herokuapp.com/api/statistics/get", requestOptions)
        const userStats = JSON.parse((await response.text()).split('?')[1])
        return userStats
    } catch (error) {
        console.log('Couldn\'t get stats for user with userID', userID,)
        throw error;
    }

}
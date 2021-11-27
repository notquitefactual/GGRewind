const characterShortNames = ['SOL', 'KYK', 'MAY', 'AXL', 'CHP', 'POT', 'FAU', 'MLL', 'ZAT', 'RAM', 'LEO', 'NAG', 'GIO', 'ANJ', 'INO', 'GLD', 'JKO'];
const readable_character_names = ['Sol', 'Ky', 'May', 'Axl', 'Chipp', 'Potemkin', 'Faust', 'Millia', 'Zato', 'Ramlethal', 'Leo', 'Nagoriyuki', 'Giovanna', 'Anji', 'I-No', 'Goldlewis', 'Jack-O']

const stories = [
]

const storyData = new Vue({
    el: "#page",
    data: { stories, activeStoryIndex: -1, showStory: false }
})
window.onload = async function () {
    console.log('Welcome fellow nerd :)')
    console.log('If you want to know where the stats below are coming from message me on my reddit account: /u/notquitefactual')
    const urlParams = new URLSearchParams(window.location.search);
    const profileURL = urlParams.get('openid.identity');
    let accountID = null
    if (profileURL) {
        accountID = profileURL.split('/').slice(-1)[0]
        console.log('accountID', accountID)
    }
    storyData.showStory = profileURL;
    storyData.showButton = !profileURL ? '' : 'none';

    let userDetails = null;
    if (profileURL) {
        userDetails = await getUserDetails(accountID);
        const userStats = await getUserStats(userDetails.UserID, 'onlineRecord');
        const userStatsAdvanced = await getUserStats(userDetails.UserID, 'onlineRecordAsAllCharsAgainstAllChars');
        const playerMain = getPlayerMain(userStats);
        const playerMainCharCode = characterShortNames.indexOf(playerMain);
        const longPlayerMainName = readable_character_names[playerMainCharCode];

        const playerMainStats = await getUserMainStats(userDetails.UserID, playerMainCharCode);
        const worstMatchup = getWorstMatchup(playerMainStats);
        const bestMatchup = getBestMatchup(playerMainStats);
        console.log('userDetails', userDetails);
        console.log('userStats', userStats);
        console.log('onlineRecord', userStatsAdvanced);
        console.log(`onlineRecord for ${longPlayerMainName}`, playerMainStats);

        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `You've spent ${getPlayTime(userStats)} hours of your life playing Guilty Gear Strive`
        });

        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `You've played ${getNumGamesPlayed(userStats)} ranked games to date`
        });

        if (getWinRate(userStatsAdvanced) > 0.5) {
            stories.push({
                img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
                text: `You've won ${(getWinRate(userStatsAdvanced) * 100).toFixed(2)}% of your ranked games`
            });
        }

        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `Your most played character is ${longPlayerMainName}`
        });


        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `You've won ${(getWinRateForMain(playerMainStats) * 100).toFixed(2)}% of your ranked games with ${longPlayerMainName}`
        });

        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `Your worst matchup with ${longPlayerMainName} is against ${worstMatchup.character} with a winrate of ${worstMatchup.winrate}%`
        });

        stories.push({
            img: 'https://image.api.playstation.com/vulcan/img/rnd/202101/2010/3hxajNDLMtgO2KwJjJpTfYUw.png',
            text: `Your best matchup with ${longPlayerMainName} is against ${bestMatchup.character} with a winrate of ${bestMatchup.winrate}%`
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

function getWinRate(userStatsAdvanced) {
    return +userStatsAdvanced.Win / +userStatsAdvanced.Match
}

function getWinRateForMain(userMainStats) {
    let matches = 0;
    let wins = 0;

    for (const item in userMainStats) {
        matches += userMainStats[item].Match;
        wins += userMainStats[item].Win;
    }

    return (wins / matches)
}

function getRomanCancels(userStatsAdvanced) {
    return +userStatsAdvanced.RomanCancel
}
function getMaxComboHit(userStatsAdvanced) {
    return +userStatsAdvanced.MaxComboHit
}
function getMaxComboDmg(userStatsAdvanced) {
    return +userStatsAdvanced.MaxComboDmg
}

function getPlayTime(userStats) {
    return (userStats.TotalPlayTime / 3600 / 60).toFixed(2)
}

function getWorstMatchup(userMainStats) {
    let indexOfWorst = 0;
    let worstWinrate = 1;
    for (let i = 0; i < characterShortNames.length; i++) {
        const data = userMainStats[i];
        indexOfWorst = data.WinPer < worstWinrate ? i : indexOfWorst;
        worstWinrate = data.WinPer < worstWinrate ? data.WinPer : worstWinrate;
    }

    const character = readable_character_names[indexOfWorst];
    const winrate = worstWinrate * 100
    return { character, winrate }
}

function getBestMatchup(userMainStats) {
    let indexOfBest = 0;
    let bestWinrate = 0;
    for (let i = 0; i < characterShortNames.length; i++) {
        const data = userMainStats[i];
        indexOfBest = data.WinPer > bestWinrate ? i : indexOfBest;
        bestWinrate = data.WinPer > bestWinrate ? data.WinPer : bestWinrate;
    }

    const character = readable_character_names[indexOfBest];
    const winrate = bestWinrate * 100
    return { character, winrate }
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

async function getUserStats(userID, mode) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();

    if (mode === 'onlineRecord') {
        urlencoded.append("data", "9295b2323131303237313133313233303038333834ad3631393064363236383739373702a5302e302e370396b2" + hexEncode(userID) + "070101ffffff");
    }
    else { // mode === 'onlineRecordAsAllCharsAgainstAllChars'
        urlencoded.append("data", "9295b2323131303237313133313233303038333834ad3631393064363236383739373702a5302e302e370396b2" + hexEncode(userID) + "0101ffffff");
    }

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
        mode: 'cors'
    };

    try {
        const response = await fetch("https://ggst-api-proxy.herokuapp.com/api/statistics/get", requestOptions)
        const userStats = JSON.parse((await response.text()).split(/(?=\{)/g)[1])
        return userStats
    } catch (error) {
        console.log('Couldn\'t get stats for user with userID', userID,)
        throw error;
    }

}

async function getUserMainStats(userID, mainCharCode) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("data", "9295b2323131303237313133313233303038333834ad3631393064363236383739373702a5302e302e370396b2" + hexEncode(userID) + "01010" + mainCharCode.toString(16) + "feff");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
        mode: 'cors'
    };

    try {
        const response = await fetch("https://ggst-api-proxy.herokuapp.com/api/statistics/get", requestOptions)
        const responseText = await response.text();
        const dataStartIndex = responseText.indexOf('{');
        const jsonData = responseText.slice(dataStartIndex);
        const userStats = JSON.parse(jsonData)
        return userStats
    } catch (error) {
        console.log('Couldn\'t get stats for user with userID', userID,)
        throw error;
    }

}


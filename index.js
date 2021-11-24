const stories = [
    {
        img: 'https://www.guiltygear.com/ggst/en/wordpress/wp-content/uploads/2020/09/archive_gio.jpg',
        text: "You've played 1000 games this year!"
    },
    {
        img: 'https://www.dustloop.com/wiki/images/a/af/GGST_Nagoriyuki_Portrait.png',
        text: 'Your most played character is Nagoriyuki'
    },
    {
        img: 'https://www.guiltygear.com/ggst/en/wordpress/wp-content/uploads/2020/09/archive_gio.jpg',
        text: 'Your most played character is Giovanna'
    }
]

const storyData = new Vue({
    el: "#page",
    data: { stories, activeStoryIndex: 0, showStory: false }
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
    }

    console.log(userDetails);
    console.log(getUserStats(userDetails.UserID))
    console.log(storyData, profileURL)
    setInterval(function () {
        goToStory(storyData.activeStoryIndex % stories.length);
        storyData.activeStoryIndex += 1;
        storyData.activeStoryIndex %= stories.length
    }, 2000);

};

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
    urlencoded.append("data", "9295b2323130363131313234363234373230333936ad3631393064363236383739373702a5302e302e370396b2323130363131313234363234373230333936070101ffffff");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
        mode: 'cors'
    };

    fetch("http://ggst-game.guiltygear.com/api/statistics/get", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    // try {
    //     const userStats = await fetch(`https://ggst-game.guiltygear.com/api/statistics/get`, {
    //         method: 'POST',
    //         mode: 'cors',
    //         headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    //         body: {data: '9295b2323130363131313234363234373230333936ad3631393064363236383739373702a5302e302e370396b2323130363131313234363234373230333936070101ffffff'}
    //     });
    //     return userStats.json();
    // } catch (error) {
    //     console.log('Couldn\'t get stats for user with userID', userID,)
    //     throw error;
    // }
}
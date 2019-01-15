// Options
const CLIENT_ID = "864414151564-0013jagsdpckh5s4347ikb5anr57975j.apps.googleusercontent.com";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

// Authorization scopes required by the API. If using multiple scopes,
// separated them with spaces.
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');

const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;
    // Get the new channel and refresh the UI
    getChannel(channel);
});

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    })
    .then(() => {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Get Channel informations
 */
function getChannel(channelSearchParam) {
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channelSearchParam
    })
    .then(response => {
        console.log("Channel by name : " + response);

        if(response.result.items.length > 0) {
            // Set the working informations
            const channel = response.result.items[0];

            // Build the output to display channel datas 
            const output = buildChannelTemplate(channel);

            // Display the channel informations
            showChannelData(output);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            requestVideoPlayList(playlistId);
        } else {
            getChannelByID(channelParam);
        }
    })
    .catch(err => 
        alert('No channel by that name : ' + channelParam, err)
    );
}

/**
 * Get channel informations from channel ID.
 */
function getChannelByID(id) {
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        id: id
    })
    .then(response => {
        console.log("Channel by ID : " + response);

        if(response.result.items.length > 0) {
            // Set the working informations
            const channel = response.result.items[0];

            // Build the output to display channel datas 
            const output = buildChannelTemplate(channel);

            // Display the channel informations
            showChannelData(output);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            requestVideoPlayList(playlistId);
        } else {
            throw 'No channel';
        }
    })
    .catch(err => 
        alert('No channel with that id : ' + id, err)
    );
}

/**
 * Build channel template.
 */
function buildChannelTemplate(channel) {
    return `
        <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
            <li class="collection-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
            <li class="collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
    `;
}

/**
 * Display channel datas.
 */
function showChannelData(data) {
    const channelData = document.getElementById('channel-data');

    channelData.innerHTML = data;
}

/**
 * Get playlist datas.
 */
function requestVideoPlayList(playlistId) {
    // Parameter object
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    }

    // Call the playlist items API endpoint
    var request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
    });
}

/**
 * Format big numbers with a comma separator. 
 */
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

# callisto-music-bot

A music bot for the gaming community known as GhostKnife of Callisto. 

## Commands: (Users with the proper role can use)

**Help** - Shows the commands and a brief description

**Play** - Select a song for the bot to search for and add to the playlist queue

**Stop** - Stops the playing song, clears the queue, and exits the bot from the voice channel

**Search** - searches for songs based on the name and lists possible songs to add to the queue *(select the number from the list to add the song)*

**playlist** - Adds a youtube playlist (via link to said playlist) to the queue

**Pause** - Pauses the currently playing song

**Resume** - Starts playing the paused music

**Skip** - Skips the currently playing song to the next in the queue

**Skipto** - Skips to a song in the queue *(by queue number)*

**NowPlaying** - Shows the current song and time left in the song

**Queue** - Shows the entire queue with pagination (navigate the pages with emojis)

**Loop** - Enabkles/disables the loop of the current song/playlist

**Shuffle** - Enables/disables the queue shuffle 

**Remove** - Removes a song *(by queue number)* from the quque

**Volume** - Sets the bot output volume *(default of 100%)*

---

## Moderation Commands (only peolpe with ADMINISTRATOR role can use the first 2. The ModRole is needed for the 3rd)

**ModRole** - Sets the music mod role in the database *(needed to add people to the music player role)* (need to mention a role)

**MusicRole** - Sets the role for the music player role in the database (need to mention a role)

**MusicControl** - Give/remove the role for people to be able to interact with the bot to play or add music to the queue (need to mention a user)

---

## Special Command

**Invite** - Sends a DM with an invite link to invite the bot to your server

---

## Bot permissions needed for deployment

VIEW_CHANNELS</br>
MANAGE_ROLES</br>
CREATE_INVITE</br>
CHANGE_NICKNAME</br>
SEND_MESSAGES</br>
EMBED_LINKS</br>
ADD_REACTIONS</br>
MANAGE_MESSAGES</br>
CONNECT</br>
SPEAK

---

## How to set up the bot

Once the bot is started and invited to your server *(Must be running before invited)* you will need to create the following rolesL *(They can be named what you want and need to be under the bot role that is automatically added)*

- Mod Role (to be able to give people the Music Role)
- Music Role (to allow people to interact with the music functionality of the bot. Mods need this role as well)

Then run the appropriate commands *(see above)* to set the roles in the database.

---

## Special Notes

The prefix is hard coded and cannot be changed at this time. 
import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import * as spotifyController from '../controllers/media/spotifyController';

const router = express.Router();

// All routes protected
router.use(protect);

// Playback
router.get('/player', spotifyController.getPlaybackState);
router.get('/token', spotifyController.getAccessToken);
router.get('/profile', spotifyController.getProfile); // Check subscription status
router.put('/player', spotifyController.transferPlayback); // Transfer Playback
router.put('/player/play', spotifyController.play);
router.put('/player/pause', spotifyController.pause);
router.post('/player/next', spotifyController.next);
router.post('/player/previous', spotifyController.previous);
router.put('/player/seek', spotifyController.seek);
router.put('/player/volume', spotifyController.setVolume);
router.put('/player/shuffle', spotifyController.setShuffle);
router.put('/player/repeat', spotifyController.setRepeat);

// YouTube Bridge
import * as videoController from '../controllers/media/videoController';
router.get('/youtube/search', videoController.searchVideo);

// Library & Search
router.get('/playlists', protect, spotifyController.getPlaylists);
router.get('/playlists/:playlistId/tracks', protect, spotifyController.getPlaylistTracks);
router.get('/search', protect, spotifyController.search);
router.get('/tracks', protect, spotifyController.getSavedTracks);
router.get('/tracks/contains', spotifyController.checkSaved);
router.put('/tracks/toggle', spotifyController.toggleSaved);

export default router;

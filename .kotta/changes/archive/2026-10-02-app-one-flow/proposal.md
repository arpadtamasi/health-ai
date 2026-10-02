# One flow: the day, the log and the chat on one screen

## Why

The owner said: "nem megy a fotó meg az egész kicsit clunky, tervezd át az appot" and attached nine Claude conversations from the first week, "kb abból akarom megtakarítani, amit lehet". The logs show what the app should make cheaper: a message or a photo per item, many repeats with a small change, frequent corrections, checking what was logged, and a fat limit that mattered as much as the calories. The in-app camera did not work on the phone at all, and a call took four seconds because the service started cold.

## What changes

The app becomes one screen: the day against its pace on top (a hero with a chart of the day and bars for protein, carbs, fat and water; a tap on a bar switches what the hero shows), one thread of today's entries and the conversation, and a dock with the usual items, the camera and the text field. A photo logs what it shows and only proposes for a fridge or a menu. Entries are corrected in place, by the card or by telling the assistant. Fat becomes the fourth macro. The hero's colour states the situation. The look is the Paprika design of the kit.

It changes these accepted stories: "Open on a full-screen home that shows the day", "Start logging from one button on the home", "See where I am against the day's pace", "Choose food and quantity with the camera" and "Correct a logged meal", and three of their examples. It adds "Choose what the home shows", "Track fat as the fourth macro" and "See today's entries in the thread", three rules, one quality scenario and eighteen examples.

The chat is also kept in our own storage during the test (text and answers, not photos, for 90 days), because the owner asked for the full history of the test; this replaces the earlier decision that the chat stays on the phone. See "The chat is kept during the test".

The service is allowed to scale to zero (the owner accepts the slow first call), so the app is built for slow answers: it shows the result of an action at once and confirms with the server, draws the last known day from the device, says when the connection is slow, and offers a retry. See "The app stays usable on a slow response". The look follows the phone's light or dark setting, on white with cool grey neutrals (no cream paper).

Outside the model but part of the work: the service may scale to zero (`MIN_INSTANCES=1` keeps one instance warm if it is ever wanted).

## Open decisions

- Is the 120 kcal threshold between red and yellow right, and should the plan be a straight line from 7:00 to 22:00 or a line with steps at mealtimes? (The assistant proposes: keep the straight line and 120 kcal, and tune in use.)
- Should the choice of what the hero shows last beyond the session? (The assistant proposes: no, the next day starts on the calories.)
- Should the chat of the test be kept for 90 days, or longer or shorter, and should the photos stay out? (The assistant proposes: 90 days like the testers' feedback, no photos, deleted with the whole history.)

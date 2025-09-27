/prompt_builder

Generate Affirmation for audio.
Input: textArea(What affirmation would you like for sleep/lucid dreaming?)
Cta: Generate Affirmation

Generate Creative & Reflection Prompts.
Input1: Prompt Type - multiChoice(Creative writing prompt, self-reflection prompt, Dream Incubation Prompt).
Input2: Theme/keyword - text
Cta: Generate Prompt

Binaural Beat Generator
Input1: Carrier Frequency (Hz) - number
Input2: Beat Frequency (Hz) - number
Input3: Duration (minutes) - number
Input4: Volume (dBFS) -number
Cta: Generate Binaural Beat

Subliminal Audio Generator.
Input1: Affirmation Text - textArea
Input2: Masking Sound - multiChoice(White Noise, Ambient Tone (Low Frequency))
Input3: Duration (minutes) - number
Input4: Subliminal Volume (dBFS): - number
Input5: Masking Volume (dBFS) - number
Cta: Generate Subliminal Audio

Your Past Prompts & Generated Audio.
pastPromtps, generated Audios.

dream_journal

Record new Dream
Input1: Dream content - textArea
Input2: Primary Emotion - multiChoice (Happy, sad, anxious, neutral, calm, excited, others)
Input3: Tags - text
Input4: Lucid Dream ? - Radio Button/Checkbox
Input5: visibility - MultiChoice( Private(only Me), friends only, public)
Cta1: save dream
Cta2: Analyze with AI

Search & Filter Dreams
Input1,2: Search Dream content(placeHolder-text), filter by tags(placeHolder-text),
Input3,4: from & to Date - date
Input5: lucid Dream - multiChoice(All, yes, no)
Cta: Apply Filters

/analytics

Dream Consistency Insights - Start journaling your dreams to see consistency insights here!
Emotional Sleep Map - Record some dreams to see your emotional sleep map!
Dream Emotions Distribution - No dream emotion data available yet.
Last 30 Days Sleep Duration - No sleep duration data available for the last 30 days.
Lucid Dreams per Day - No lucid dream data available yet. Mark dreams as lucid in your journal!
Sleep & Dream Correlations - Not enough combined sleep and dream data to calculate correlations. Please ensure you have recorded both sleep plans and dream entries (including lucid status).

/sleep_Planner

Set Today’s Sleep Plan
Input1: what’s your sleep goal for tonight? - Text
Input2,3: Target Bedtime, WakeTime - Time
Cta1: save plan
Cta2: Generate Ritual with AI

Your past sleep plans
Past sleep plans data

/sleep_recorder
Record Your Sleep Sounds
Input1: Start Recording,Stop Recording – Audio recording
Input2: Notes (Optional) - text area

Your Past Sleep Recordings
Past sleep recordings data(audio, notes)

/audio_library

Upload your own audio
Input1: Select Audio File (MP3, WAV, OGG) - fileSelector
Input2: Title - text
Input3: Description - textArea
Cta: upload audio

Your audio collection
Uploaded, generated(from prompt_builder - subliminal, binaural, affirmation audio) Audio files data - audio
Cta: add sample audio

/dream_art
Upload Your Own Dream Art
Input1: Select Image File (PNG, JPG, GIF, WEBP) - fileSelector
Input2: Title (e.g., My Flying Dream) - text
Input3: Description (Optional) - textArea
Cta: upload ArtWork

Generate AI Dream Image (Placeholder)
Input1: Prompt for AI Image - text
Cta: Generate Image

Your Dream Art Collection
Uploaded, Generated Art collection data

/lucid_trainer
Reality Check Notifications
Input1: Enable Notifications - on/off button
Input1’s label: when on Scheduled every input2-number min, when off notifications Enabled
Input2: Frequency(minutes) - number
Cta1: save settings
Cta2: test Notification

Reality Check Techniques

Display this text: **Finger Through Palm:** Push a finger into your opposite palm. In a dream, it might go through.
**Nose Pinch:** Pinch your nose and try to breathe. In a dream, you might still be able to.
**Hands Check:** Look closely at your hands. Are there too many/few fingers? Do they look distorted?
**Time/Text Check:** Look at a clock or text, look away, then look back. Does it change?
**Light Switch:** Try to turn a light on/off. In dreams, they often don't work or act strangely.

Your Lucid Dream Statistics - Total Dreams Logged, Lucid Dreams Recorded, Lucid dream ratio
Guided Techniques
Display this text:
Explore various techniques to induce and stabilize lucid dreams.
MILD (Mnemonic Induction of Lucid Dreams)
WILD (Wake Initiated Lucid Dreams)
DOTS (Dreaming on The Spot)

Cta: Explore Techniques - Popup displays this data:
Lucid Dreaming Techniques
MILD (Mnemonic Induction of Lucid Dreams)
Description: This technique involves repeatedly telling yourself that you will remember to recognize you're dreaming while falling asleep, combined with vivid visualization of becoming lucid in a dream.
Steps:
Before bed, set an intention to remember your dreams.
Wake up after 4-6 hours of sleep (e.g., using an alarm).
Recall your most recent dream. If you can't, think about anything.
As you fall back asleep, repeatedly tell yourself: "Next time I'm dreaming, I will remember that I'm dreaming."
Visualize yourself becoming lucid in the dream you just woke from. Imagine performing a reality check and realizing you're dreaming.
Continue until you fall asleep.
WILD (Wake Initiated Lucid Dreams)
Description: WILD involves going directly from a waking state into a dream without losing consciousness. This often involves experiencing hypnagogic imagery and sensations.
Steps:
Lie still in bed, focusing on your breath or a simple image.
Relax your body completely. Avoid moving.
Pay attention to hypnagogic imagery (visuals or sounds) that arise.
Let yourself drift, but maintain a sliver of awareness. The goal is to transition directly into a dream.
If successful, you will enter a dream fully aware.
DOTS (Dreaming on The Spot)
Description: A straightforward technique where you simply decide to have a lucid dream just before falling asleep, and then focus on that intention as you drift off.
Steps:
Lie down comfortably.
Close your eyes and affirm: "I will have a lucid dream tonight."
Concentrate purely on the intention of becoming lucid, without trying too hard or straining.
Allow yourself to fall asleep naturally while holding this intention.
Cta: close

/spirit_guide

Initial Chat:
You: Initial greeting by Spirit Guide.
Spirit Guide: Greetings, sridinesh. I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?

Chat Interface - input1 - text, cta1: send, cta2: New Chat(should delete past chat data and create a newChat)

/social_community
Input1: Search for people - search
Button1: All - Shared Dreams - Dreams data that are shared
Button2: Requests -
Friend Requests
Received Requests
Sent Requests
Button3: Friends - Your Friends - Friends Data(profiles)

/shared_dreams
Dream From friends - dreams data that are with “friends only” visibility(from dream_journal)
Public Dreams - dreams data that are with “public” visibility (from dream_journal)

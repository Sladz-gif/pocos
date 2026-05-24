# Pocos — Interactions, Navigation & Sample Data Prompt
### Every button, tab, click, and what it does
**For Windsurf — paste directly after the main build prompt**

---

## HOW TO USE THIS DOCUMENT

This document is the second half of the Pocos build specification. Where the first document described *what* to build, this document describes *what happens* when a user taps anything. Every screen, every button, every tab transition, every modal, and every piece of sample data is specified here. Seed all sample data into a local SQLite database on first app launch so the app looks fully populated during development and demo.

---

---

# PART A — SAMPLE DATA

Seed all of the following on first app launch. Wrap the seed function in a check so it only runs once (`AsyncStorage` flag `'pocos_seeded': 'true'`).

---

## Ranch

```
Ranch Name:     Asante Farms
Location:       Ejisu, Ashanti Region, Ghana
Currency:       GHS (₵)
Established:    2019
Super Admin:    Kwame Asante
```

---

## Staff Members

| Full Name | Role | Access Code | Status |
|---|---|---|---|
| Kwame Asante | Super Admin | (email login) | Active |
| Abena Mensah | Store Manager | AM-5521 | Active |
| Kofi Darko | Field Hand | KD-3847 | Active |
| Akosua Boateng | Livestock Manager | AB-7762 | Active |
| Yaw Owusu | Field Hand | YO-1193 | Active |
| Ama Adomako | Field Hand | AA-6630 | Inactive |

---

## Animals (12 total)

| ID | Name | Sex | Acquired | Date | Colour | Weight | Dam ID | Sire ID |
|---|---|---|---|---|---|---|---|---|
| AS-001 | Abena | Female | Born | 12 Mar 2020 | Brown & White | 498 kg | Unknown | Unknown |
| AS-002 | Kofi | Male | Purchased | 04 Jun 2019 | All Black | 634 kg | Unknown | Unknown |
| AS-003 | Akua | Female | Born | 22 Aug 2020 | Red-Brown | 441 kg | AS-001 | AS-002 |
| AS-004 | Kweku | Male | Born | 07 Jan 2021 | Brown & White | 589 kg | AS-001 | AS-002 |
| AS-005 | Adwoa | Female | Purchased | 15 Nov 2020 | All White | 462 kg | Unknown | Unknown |
| AS-006 | Yaa | Female | Born | 30 Apr 2022 | Brown & White | 378 kg | AS-003 | AS-002 |
| AS-007 | Esi | Female | Born | 14 Sep 2022 | Spotted Black | 355 kg | AS-005 | AS-004 |
| AS-008 | Kojo | Male | Purchased | 03 Mar 2021 | Dark Brown | 601 kg | Unknown | Unknown |
| AS-009 | Araba | Female | Born | 19 Feb 2023 | Red-Brown | 312 kg | AS-003 | AS-008 |
| AS-010 | Efua | Female | Born | 05 Jul 2023 | Brown & White | 298 kg | AS-005 | AS-004 |
| AS-011 | Nana | Female | Born | 27 Oct 2023 | All Black | 271 kg | AS-006 | AS-002 |
| AS-012 | Mensah | Male | Born | 11 Mar 2024 | Brown & White | 189 kg | AS-007 | AS-008 |

---

## Medication Records

| Animal | Medication | Date Given | Wear-off Date | Logged By |
|---|---|---|---|---|
| AS-007 (Esi) | Oxytetracycline | 19 May 2026 | 21 May 2026 | Akosua Boateng |
| AS-003 (Akua) | Ivermectin | 14 May 2026 | 21 May 2026 | Akosua Boateng |
| AS-011 (Nana) | Vitamin B12 | 10 May 2026 | 24 May 2026 | Kofi Darko |
| AS-001 (Abena) | Oxytetracycline | 01 May 2026 | 03 May 2026 | Akosua Boateng |

---

## Feed Records

| Feed Type | Purpose | Special Purpose | Applies To |
|---|---|---|---|
| Rhodes Grass + Hay | Daily maintenance | No | All animals |
| Cottonseed Cake | Weight gain | Yes — Pre-market fattening | AS-002, AS-008, AS-004 |
| Molasses & Bran Mix | Nutrition boost | Yes — Lactation support for nursing cows | AS-003, AS-005, AS-006 |
| Calf Starter Pellets | Early growth | Yes — Calf development (under 12 months) | AS-011, AS-012 |

---

## Pregnancy Records

| Dam | Sire | Mating Date | Expected Delivery | Status | Calves |
|---|---|---|---|---|---|
| AS-001 (Abena) | AS-002 (Kofi) | 12 Jun 2019 | 21 Mar 2020 | Delivered | AS-003, AS-004 |
| AS-003 (Akua) | AS-002 (Kofi) | 15 Jul 2021 | 24 Apr 2022 | Delivered | AS-006 |
| AS-005 (Adwoa) | AS-004 (Kweku) | 10 Dec 2021 | 19 Sep 2022 | Delivered | AS-007 |
| AS-003 (Akua) | AS-008 (Kojo) | 20 May 2022 | 28 Feb 2023 | Delivered | AS-009 |
| AS-005 (Adwoa) | AS-004 (Kweku) | 01 Oct 2022 | 10 Jul 2023 | Delivered | AS-010 |
| AS-006 (Yaa) | AS-002 (Kofi) | 08 Jan 2023 | 17 Oct 2023 | Delivered | AS-011 |
| AS-007 (Esi) | AS-008 (Kojo) | 22 Jun 2023 | 31 Mar 2024 | Delivered | AS-012 |
| AS-003 (Akua) | AS-008 (Kojo) | 14 Nov 2025 | 28 Aug 2026 | Pregnant | — |
| AS-006 (Yaa) | AS-004 (Kweku) | 02 Dec 2025 | 15 Sep 2026 | Pregnant | — |

---

## Tasks

| Title | Assigned To | Recurring | Time | Status |
|---|---|---|---|---|
| Morning feed | Kofi Darko | Daily | 06:00 | Completed today |
| Open grazing gates | Yaw Owusu | Daily | 07:30 | Pending |
| Evening head count | All staff | Daily | 18:00 | Pending |
| Close grazing gates | Yaw Owusu | Daily | 17:30 | Pending |
| Weigh animals — Pen B | Akosua Boateng | Weekly (Mon) | 08:00 | Pending |
| Check water troughs | Kofi Darko | Daily | 07:00 | Completed today |
| Vet visit follow-up | Akosua Boateng | None (one-off) | — | Pending |

**Subtasks for "Morning feed":**
- Fill water troughs first — Completed
- Distribute hay bales to Pen A — Completed
- Distribute cottonseed cake to bulls — Completed

**Comments on "Morning feed":**
- Kofi Darko · 06:12 · "All done. Pen A troughs were low, topped them up."
- System · 06:12 · "Task marked complete by Kofi Darko"

**Comments on "Check water troughs":**
- Kofi Darko · 07:04 · "Trough 3 in Pen B has a small leak — patched temporarily with tape. Needs proper fixing this week."

---

## Notes

| Title | Author | Date | Body |
|---|---|---|---|
| Vet visit follow-up | Akosua Boateng | 19 May 2026 | "Dr. Acheampong recommends zinc supplementation for all calves under 6 months. He'll be back in 3 weeks for the next round of deworming. Also flagged that Esi (AS-007) may have a respiratory issue — keep an eye on her." |
| Feed store stock | Kwame Asante | 17 May 2026 | "Cottonseed cake is running low — about 2 bags left. Order at least 10 bags before end of week. Supplier is Agro Masters in Kumasi, contact is 0244-XXXXXX." |
| Breeding plan Q3 2026 | Kwame Asante | 15 May 2026 | "Plan to mate Adwoa (AS-005) with Mensah (AS-012) once he reaches 250kg. Also considering bringing in an external bull for genetic diversity — speak to Fafali Ranch." |

---

## Chat Messages (Team Group: "Asante Farms")

```
Kofi Darko        06:12   "Morning feed done. Trough 3 in Pen B needs repair — check my task note."
Kwame Asante      06:48   "Noted Kofi, good catch. I'll log a repair task today."
Akosua Boateng    07:15   "Esi is coughing this morning — already logged it in her profile. Might need the vet sooner."
Kwame Asante      07:22   "Keep watching her today. If she gets worse call Dr. Acheampong directly."
Abena Mensah      08:05   "Morning everyone. 3 new store orders came in overnight — 2 beef, 1 milk subscription. I'll handle them."
Yaw Owusu         08:30   "Gates are open. All 12 out in the field."
Akosua Boateng    09:14   "Weighed the bulls this morning. Kofi gained 8kg since last Monday 💪"
Kwame Asante      09:30   "Great progress. Let's keep the cottonseed cake going for the bulls."
```

---

## Store Listings

| Product | Category | Price | Unit | Stock | Status | Discount |
|---|---|---|---|---|---|---|
| Grass-fed Beef | Beef & Meat | ₵85 | per kg | 45 kg | Listed | None |
| Fresh Whole Milk | Milk & Dairy | ₵18 | per litre | 30 litres/day | Listed | None |
| Live Cattle — AS-008 Kojo | Live Cattle | ₵4,800 | per head | 1 | Listed | None |
| Hay Bales | Feed & Hay | ₵45 | per bale | 60 bales | Unlisted | None |
| Bulk Beef (10kg+) | Beef & Meat | ₵85 | per kg | 45 kg | Listed | 10% off 10kg+ |
| Fresh Milk — Weekly Sub | Milk & Dairy | ₵110 | per week | Unlimited | Listed | None |

---

## Orders (Consumer-side)

| Order # | Buyer | Item | Qty | Total | Status |
|---|---|---|---|---|---|
| ORD-001 | Nana Adjei | Grass-fed Beef | 3 kg | ₵255 | Confirmed |
| ORD-002 | Esi Quaye | Fresh Whole Milk | 5 litres | ₵90 | Pending |
| ORD-003 | Kwabena Asare | Grass-fed Beef | 10 kg | ₵765 (10% off) | Pending |

---

## Consumer Accounts (Sample buyers)

```
Name:   Nana Adjei        Email: nana.adjei@gmail.com
Name:   Esi Quaye         Email: esiquaye22@yahoo.com
Name:   Kwabena Asare     Email: kwabs.asare@outlook.com
```

---
---

# PART B — INTERACTIONS & NAVIGATION

Every interactive element is described below, screen by screen. Format: element name → what happens.

---

## WELCOME SCREEN

**"I run a ranch" card (tap)**
→ Navigate to `RanchLoginScreen`

**"I want to buy" card (tap)**
→ Navigate to `ConsumerSignUpScreen` (new users) or `ConsumerSignInScreen` (returning). Show a small toggle at the top of the consumer auth screens: "New here? Sign up" / "Already have an account? Sign in"

**"Create a ranch account" text link (tap)**
→ Navigate to `RanchOnboardingScreen` — a multi-step form:
  - Step 1: Ranch name, location, currency
  - Step 2: Super Admin name, email, password
  - Step 3: Review + "Create Ranch" button
  - On success → navigate to `HomeScreen` as Super Admin

---

## RANCH LOGIN SCREEN

**Access code input field (focus)**
→ Keyboard opens. Input uses DM Mono font. All caps enforced. Placeholder: "e.g. AM-5521"

**"Sign In" button (tap with valid code)**
→ Validate against staff records. On match:
  - If role is `super_admin` → navigate to `HomeScreen` (Super Admin view)
  - If role is `store_manager` → navigate to `HomeScreen` (Store Manager view, Tab 5 visible)
  - If role is `staff` → navigate to `HomeScreen` (Staff view, Tab 5 hidden)
  - Record login time for activity monitoring

**"Sign In" button (tap with invalid code)**
→ Shake animation on the input field. Show inline error text below input: "Code not recognised. Check with your ranch admin." in Danger Crimson.

**"I'm the ranch owner — sign in differently" link (tap)**
→ Navigate to `RanchOwnerLoginScreen` (email + password form)

---

## RANCH OWNER LOGIN SCREEN

**Email input (focus)** → keyboard opens, email type

**Password input (focus)** → keyboard opens, secure text entry, show/hide toggle eye icon on right

**"Sign In" button (tap — valid)**
→ Authenticate. Navigate to `HomeScreen` as Super Admin.

**"Sign In" button (tap — invalid)**
→ Shake on both inputs. Error: "Incorrect email or password."

**Back arrow (top left)**
→ Navigate back to `RanchLoginScreen`

---

## HOME SCREEN (Tab 1)

**Settings / Gear icon (top right — Super Admin only)**
→ Navigate to `AdminPanelScreen` (stack push, not tab switch)

**"On Medication" stat card (tap)**
→ Navigate to `HerdScreen` with Medication sub-tab pre-selected and filter set to "Active"

**"Tasks Due Today" stat card (tap)**
→ Navigate to `TaskBoardScreen` with "Today" section expanded and others collapsed

**"Total Cattle" stat card (tap)**
→ Navigate to `HerdScreen` with Profiles sub-tab pre-selected, no filters applied

**"Pregnant" stat card (tap)**
→ Navigate to `HerdScreen` with Breeding sub-tab, Pregnancies view, filter: "Pregnant"

**Activity item — "Medication wear-off" (tap)**
→ Navigate to that animal's `AnimalDetailScreen`, Medication tab pre-selected

**Activity item — "New calf born" (tap)**
→ Navigate to that calf's `AnimalDetailScreen`, Info tab pre-selected

**Activity item — "New store order" (tap)**
→ Navigate to `OrdersScreen` inside Store tab, filter: Pending

**Activity item — any task event (tap)**
→ Navigate to that `TaskDetailScreen`

**Staff avatar on "Staff On Duty" row (tap — Super Admin only)**
→ Navigate to `StaffActivityScreen` for that staff member (stack push)

**Quick Action — "Add Animal" button**
→ Navigate to `AddAnimalScreen` (modal slide-up)

**Quick Action — "Log Medication" button**
→ Navigate to `AddMedicationScreen` (modal slide-up)

**Quick Action — "Create Task" button**
→ Navigate to `CreateTaskScreen` (modal slide-up)

**Quick Action — "New Chat Message" button**
→ Navigate to `ChatHomeScreen` (switches to Tab 4)

---

## HERD TAB (Tab 2)

### Sub-tab bar

**"Profiles" sub-tab (tap)**
→ Show animal profiles list. If already on Profiles, scroll to top.

**"Medication" sub-tab (tap)**
→ Show medication log list

**"Feeding" sub-tab (tap)**
→ Show feed records list

**"Breeding" sub-tab (tap)**
→ Show breeding screen with its own sub-tabs (Pregnancies / Nursing / Ancestry)

---

### Profiles — List Screen

**Search bar (tap)**
→ Keyboard opens. As user types, list filters in real time by Animal ID or Name. Matching characters highlighted in Rust.

**Search bar — clear icon (×) (tap)**
→ Clear search input, restore full list

**Filter chip "All" (tap)**
→ Remove all filters, show all 12 animals

**Filter chip "Female" (tap)**
→ Filter to show only female animals (Abena, Akua, Adwoa, Yaa, Esi, Araba, Efua, Nana). Chip turns Rust filled.

**Filter chip "Male" (tap)**
→ Filter to show only males (Kofi, Kweku, Kojo, Mensah)

**Filter chip "Pregnant" (tap)**
→ Filter to show only pregnant animals (Akua AS-003, Yaa AS-006)

**Filter chip "Purchased" (tap)**
→ Filter to show only purchased animals (AS-002 Kofi, AS-005 Adwoa, AS-008 Kojo)

**Filter chip "Born on Ranch" (tap)**
→ Filter to show only ranch-born animals

**Animal card — anywhere on the card (tap)**
→ Navigate to `AnimalDetailScreen` for that animal

**Floating "+" button (tap)**
→ Navigate to `AddAnimalScreen` as a modal sheet that slides up from the bottom

---

### Add Animal Screen

**"Born on ranch" / "Purchased" toggle switch**
→ If Born: show "Date of Birth" label on date picker. Hide "Purchased From" field.
→ If Purchased: show "Date Purchased" label. Show "Purchased From" text input below it.

**Animal ID field (focus)**
→ Auto-populates with the next available ID (e.g. "AS-013"). User can tap and edit it. DM Mono font.

**Sex — "Female" segment (tap)**
→ Segment turns Rust filled. Gender icon on profile cards will be ♀.

**Sex — "Male" segment (tap)**
→ Segment turns Deep Plum filled.

**Date picker field (tap)**
→ Opens native `DateTimePicker` component. On iOS shows inline spinner. On Android shows a dialog.

**Photo placeholder / camera icon (tap)**
→ Opens `expo-image-picker` with two options: "Take Photo" or "Choose from Library". On image selected, replace placeholder with the photo preview (rounded square, 100×100). Show a small "×" remove button on the corner.

**"Save Profile" button (tap — all required fields filled)**
→ Validate: Animal ID not duplicate, sex selected, date set.
→ Save to SQLite animals table.
→ Show a brief success toast at bottom: "AS-013 profile created ✓" in Success Moss.
→ Close modal. List refreshes. New animal appears at top of list.

**"Save Profile" button (tap — required fields missing)**
→ Highlight empty required fields with Danger Crimson border.
→ Show error text below each empty required field: "This field is required."

**Back / close icon (top left)**
→ If any field has been filled: show a small alert: "Discard changes?" with "Discard" (Crimson) and "Keep editing" (ghost). If no fields filled: close immediately.

---

### Animal Detail Screen

**Back arrow (top left)**
→ Navigate back to animal list (or wherever the user came from)

**Edit icon (pencil, top right)**
→ Navigate to `EditAnimalScreen` — same form as Add Animal, pre-populated with this animal's data. Save button label changes to "Save Changes".

**"Info" tab (tap)**
→ Show all profile fields: ID, name, sex, acquired type, date, purchased from (if applicable), colour, weight. Clean key-value list.

**"Medication" tab (tap)**
→ Show medication records filtered to this animal only. Same card style as the main medication list. "Log medication" button at bottom navigates to `AddMedicationScreen` with this animal pre-selected.

**"Feeding" tab (tap)**
→ Show feed records where this animal is included. Each card shows feed type, purpose, special purpose badge.

**"Breeding" tab (tap)**
→ Show this animal's breeding records:
  - Dam and Sire row (tappable — navigates to their profile)
  - Pregnancies if female (list of pregnancy records)
  - Calves born (list, each tappable)
  - If male: list of dams he was mated with and resulting calves

**"Ancestry Tree" tab (tap)**
→ Render the SVG family tree for this animal. 3 levels shown by default: grandparents (if known) at top, parents in middle, selected animal highlighted in center, calves below.
→ Each node in the tree: tap navigates to that animal's `AnimalDetailScreen`
→ "Unknown" nodes (greyed, dashed border) are not tappable
→ Pinch to zoom: use `react-native-gesture-handler` PinchGestureHandler for zoom in/out on the tree SVG
→ Pan/drag: `PanGestureHandler` to scroll around a large tree

---

### Medication — List Screen

**Filter "All" chip** → show all medication records

**Filter "Active" chip** → show records where today's date is before wear-off date

**Filter "Expiring Soon" chip** → show records where wear-off date is within 48 hours. If any records match, the Amber banner at top is also visible.

**Filter "Expired" chip** → show records where wear-off date is in the past

**Amber banner "⚠ 2 medications expiring within 48 hours" (tap)**
→ Automatically apply "Expiring Soon" filter

**Medication card — Animal ID/name link (tap)**
→ Navigate to that animal's `AnimalDetailScreen`, Medication tab pre-selected

**Medication card — full card tap**
→ Expand card inline to show full detail including notes. Second tap collapses.

**Floating "+" button**
→ Navigate to `AddMedicationScreen` (modal sheet)

---

### Add Medication Screen

**"Animal" picker (tap)**
→ Opens a searchable bottom sheet with the full animal list. Type to filter. Each row shows animal ID + name. Tap to select. Selected animal name shown in the field with a small ×.

**"Date Given" field (tap)**
→ Opens native `DateTimePicker`. Defaults to today.

**Withdrawal period input — "Number of days" option**
→ Numeric input. On value change, auto-calculate and show below: "Wear-off date: 21 May 2026" in Success Moss text, so the user sees the calculated date immediately.

**Withdrawal period — "Pick exact date" toggle**
→ Hides the days input, shows a date picker instead.

**"Save" button**
→ Save record. If wear-off date is within 48 hours from today, automatically schedule a local push notification via `expo-notifications`. Show success toast. Close modal.

---

### Feeding — List Screen

**Feed record card — full card tap**
→ Expand to show the full animals list this feed applies to. Each animal ID/name is tappable → navigates to that animal's profile.

**Floating "+" button**
→ Navigate to `AddFeedRecordScreen` (modal sheet)

---

### Add Feed Record Screen

**"Special purpose?" toggle switch (turn ON)**
→ Animate in a text input below: "Describe the special purpose". Example placeholder: "Lactation support for nursing cows"

**"Apply to Animals" field (tap)**
→ Opens bottom sheet multi-select picker. Toggle "All Animals" at top (selects/deselects all). Or tap individual animals to select. Confirm button at bottom of sheet.

**"Save" button** → Save record. Success toast. Close.

---

### Breeding — Pregnancies Tab

**"Add Pregnancy Record" button (tap)**
→ Navigate to `AddPregnancyScreen` (modal sheet)

**Pregnancy card — Dam name/ID link (tap)**
→ Navigate to dam's `AnimalDetailScreen`

**Pregnancy card — Sire name/ID link (tap)**
→ Navigate to sire's `AnimalDetailScreen`

**Pregnancy card — calf ID badge (tap)**
→ Navigate to that calf's `AnimalDetailScreen`

**Pregnancy card — Status badge "Delivered" (long press)**
→ No action (already delivered)

**Pregnancy card — Status badge "Pregnant" (tap)**
→ Opens a small action sheet: "Mark as Delivered" | "Mark as Lost" | "Cancel"
→ "Mark as Delivered" → opens `RecordDeliveryScreen`: enter number of calves born, enter each calf's new Animal ID (auto-suggested), confirm. On save, creates new animal profiles for each calf with dam/sire pre-linked, and updates pregnancy status to Delivered.
→ "Mark as Lost" → shows confirmation modal: "Mark this pregnancy as lost? This cannot be undone." Confirm → updates status.

---

### Add Pregnancy Record Screen

**"Dam" picker (tap)**
→ Bottom sheet picker, shows only female animals

**"Sire is external" toggle (turn ON)**
→ Hides the sire picker, shows a text field: "External sire description (optional)" e.g. "Bull from Fafali Ranch, Kumasi"

**"Mating Date" picker (tap)**
→ Date picker. On date selected, auto-calculate Expected Delivery Date as mating date + 283 days. Show it immediately below: "Estimated delivery: 28 Aug 2026". User can still edit the delivery date manually.

---

### Breeding — Nursing Tab

**"Mark as Weaned" button on a nursing record (tap)**
→ Confirmation modal: "Mark [Calf Name] as weaned from [Mother Name]? This will update the nursing status." → Confirm → update nursing status to "Weaned". Card moves to a "Weaned" section below.

---

### Breeding — Ancestry Tab

**Animal search field (tap)**
→ Opens searchable list. On selection, render the ancestry tree for that animal.

**Tree node (tap)**
→ Navigate to that animal's `AnimalDetailScreen`

**"Unknown" node (tap)**
→ No navigation. Small tooltip appears: "No record — this animal was purchased with unknown parentage."

**Zoom gesture** → Pinch in/out to zoom

**Pan gesture** → Drag to navigate around large trees

---

## TASKS TAB (Tab 3)

### Task Board Screen

**"Today" section header (tap)**
→ Collapse/expand the Today section. Chevron animates 180°.

**"Upcoming" section header (tap)**
→ Collapse/expand.

**"Completed" section header (tap)**
→ Collapse/expand. Shows all completed tasks in reverse chronological order. Never emptied automatically.

**"Notes" pill/button at top of screen (tap)**
→ Navigate to `NotesScreen`

**Task row — checkbox circle (tap)**
→ Animate the circle: scale bounce + fill green + checkmark appears. Task title gets strikethrough. A system comment is auto-added: "Task marked complete by [User Name] · [time]". Task moves to Completed section with a smooth slide animation. The checkbox is still tappable to undo: tap again on a completed task's checkbox → confirmation modal: "Mark this task as incomplete?" → Confirm → moves back to Today/Upcoming, removes strikethrough.

**Task row — anywhere except checkbox (tap)**
→ Navigate to `TaskDetailScreen` for that task

**"+" button (top right)**
→ Navigate to `CreateTaskScreen` (modal sheet slides up)

**Task row — long press**
→ Show a context menu with 3 options: "Edit", "Delete", "Mark complete". Each option performs same action as described in detail screen.

---

### Task Detail Screen

**Back arrow (top left)**
→ Navigate back to `TaskBoardScreen`

**Three-dot menu (top right)**
→ Action sheet with: "Edit task" | "Delete task"
→ "Edit task" → navigate to `EditTaskScreen` (same form, pre-populated)
→ "Delete task" → `PDeleteModal`: "Are you sure you want to delete '[Task Title]'? This cannot be undone." → "Cancel" (ghost) | "Delete" (Danger Crimson filled) → on confirm: remove from list, navigate back, show toast "Task deleted"

**Title (tap — inline edit)**
→ Title becomes an editable TextInput. Keyboard opens. On blur/done → auto-save.

**"Assigned to" field (tap)**
→ Bottom sheet staff picker. Shows all staff avatars + names. Tap to assign. "Unassigned" option at top.

**"Due Date / Time" field (tap)**
→ Opens `DateTimePicker` with both date and time selection.

**"Recurring task?" toggle (turn ON)**
→ Animate in: Frequency picker row ("Daily" | "Every X days" | "Weekly" | "Custom"). If "Every X days" selected, show a number input. If "Custom" selected, show day-of-week checkboxes (Mon Tue Wed Thu Fri Sat Sun). If "Weekly" selected, show day-of-week single select.

**"Set reminder" toggle (turn ON)**
→ Animate in: Time picker. "Remind me at:" with a time input. On save, schedule a local push notification via `expo-notifications` for this time on the task's due date. If recurring, schedule for each recurrence.

**Subtask checkbox (tap)**
→ Same animation as main task checkbox. Subtask text gets strikethrough. Progress indicator on the parent task card updates (e.g. "2/3").

**"Add subtask" inline input (tap)**
→ Keyboard opens, placeholder "Add a subtask...". On submit (return key or "Add" button): new subtask appears in the list with a slide-in animation. Input clears for the next entry.

**Subtask — swipe left**
→ Reveal a red "Delete" button. Tap → `PDeleteModal` for that subtask. On confirm: remove subtask with slide-out animation.

**Comment input (tap)**
→ Keyboard opens. Text input at bottom. "Post" button turns active (Rust) when text is entered.

**"Post" button (tap)**
→ Add comment to list with author name, timestamp, and text. Smooth slide-in animation. Input clears. List scrolls to show new comment.

---

### Create Task Screen

**Title input (focus)**
→ Large, Playfair Display font, prominent. Keyboard opens.

**"Add subtasks" section — "+" icon (tap)**
→ Inline text input appears. Type subtask title + press return to add. Keep adding. Each subtask shows as a row with a checkbox (unchecked) and a drag handle for reordering.

**"Create Task" button (tap — title filled)**
→ Save to SQLite. Close modal. Navigate to task detail for the new task (so user can see it immediately). Show brief toast: "Task created ✓"

**"Create Task" button (tap — title empty)**
→ Highlight title input with Crimson border. Error text: "Please give this task a title."

---

### Notes Screen

**Back arrow**
→ Navigate back to Task Board

**"Add Note" button (tap)**
→ Navigate to `CreateNoteScreen`: full-screen editor with a title input (large, Playfair) and a multi-line body (DM Sans). Save button top right. Auto-saves draft as user types.

**Note card (tap)**
→ Navigate to `NoteDetailScreen`: read-only view of the note. Edit icon (pencil) top right → navigate to edit screen.

**Note card — three-dot menu or swipe left**
→ "Delete" option → `PDeleteModal` → on confirm: remove with slide-out animation.

---

## CHAT TAB (Tab 4)

### Chat Home Screen

**"Asante Farms" group row (tap)**
→ Navigate to `GroupConversationScreen` for the ranch group

**Direct message row (tap)**
→ Navigate to `DirectConversationScreen` for that staff member

**"+" floating button (tap)**
→ Bottom sheet: "New direct message" → shows staff list picker. Tap a staff member → navigate to `DirectConversationScreen` (new or existing).

**Unread badge**
→ Shown as a filled Rust circle with number. Disappears when user opens that conversation.

---

### Conversation Screen (Group or Direct)

**Header — group name / person name (tap)**
→ Navigate to `GroupInfoScreen` (for group) or `StaffProfileScreen` (for DM). Group info shows: group name, member list with roles, admin badge on Kwame Asante.

**Message list (loads)**
→ Scroll to most recent message automatically. Load older messages as user scrolls up (pagination in groups of 20).

**A message bubble (long press)**
→ Small action menu appears above the bubble: "Copy text" | "Reply" (future feature, can stub). Tapping outside dismisses the menu.

**Text input (tap)**
→ `KeyboardAvoidingView` lifts the entire message list and input bar above the keyboard. Input is never hidden.

**Text input (type)**
→ "Send" button becomes active (filled Rust).

**"Send" button (tap)**
→ Message appears in list immediately with an animation slide-in from bottom right. Input clears. List scrolls to bottom.

**Back arrow**
→ Navigate back to Chat Home. Unread count for this conversation clears.

---

## STORE TAB (Tab 5)
### Store Management — Manage Mode

**"Manager View ↔ Buyer Preview" toggle (top right) (tap)**
→ Re-render the entire Store tab in consumer/buyer view. A prominent banner appears at very top: "👁 Viewing as buyer — tap here to return to manager view." Background colour of banner: Deep Plum, white text.

**Listings tab (default)**
→ Shows the 2-column product grid

**"Orders" tab (tap)**
→ Shows `OrdersScreen` within the store

**"Discounts" tab (tap)**
→ Shows `DiscountsScreen` within the store

**Product listing card — status toggle "Listed / Unlisted" (tap)**
→ Toggle switches instantly. If going Unlisted: show a brief tooltip "This product is now hidden from buyers." If going Listed: "This product is now visible to buyers." No confirmation modal needed (easily reversible).

**Product listing card — anywhere on card except toggle (tap)**
→ Navigate to `ListingDetailScreen`: full detail view of the listing with all fields. Edit icon top right.

**"+ Add product" button (tap)**
→ Navigate to `AddListingScreen` (modal sheet)

---

### Add Listing Screen

**Category picker (tap)**
→ Bottom sheet with 5 options: "Live Cattle" | "Beef & Meat" | "Milk & Dairy" | "Feed & Hay" | "Other". Icon next to each. Tap to select.

**"Link to animal" picker (tap) — visible when category is "Live Cattle"**
→ Searchable bottom sheet of all animals. Selecting an animal means the buyer will see that animal's stats (DOB, weight, vaccination records) on the product detail page.

**Price input (focus)**
→ Numeric keyboard. Currency prefix "₵" is static label, not part of input.

**Unit picker (tap)**
→ Inline picker: "per kg" | "per head" | "per litre" | "per bale" | "per unit"

**Photo picker (tap)**
→ Opens `expo-image-picker`. Up to 3 photos. Thumbnails shown in a row. Tap any thumbnail to preview full size. Tap "×" on a thumbnail to remove.

**"Apply a discount?" toggle (turn ON)**
→ Animate in discount section:
  - Discount type picker: "Percentage off" | "Fixed amount off" | "Bulk discount"
  - If "Percentage off": numeric input + "%" suffix
  - If "Fixed amount off": numeric input with "₵" prefix
  - If "Bulk discount": two inputs: "Min quantity" and "Discount %"
  - Expiry date toggle: "Set expiry?" → date picker if ON

**"Save" button**
→ Validate required fields. Save listing. If "List immediately" was toggled ON, listing is live. Navigate back to store grid. New listing appears at top of grid.

---

### Orders Screen (Store)

**"Pending" tab (tap)** → filter to pending orders
**"Fulfilled" tab (tap)** → filter to confirmed/dispatched/completed
**"All" tab (tap)** → show all orders

**Order card — "Confirm Order" button (tap)**
→ Status updates to "Confirmed". Button changes to "Mark Dispatched". Success toast: "Order ORD-001 confirmed."

**Order card — "Mark Dispatched" button (tap)**
→ Status updates to "Dispatched". Button changes to "Mark Completed".

**Order card — "Cancel" button (tap)**
→ Confirmation modal: "Cancel this order from [Buyer Name]? This cannot be undone." → Confirm → status: "Cancelled". Card moves to bottom of list with a grey badge.

**Order card — buyer name (tap)**
→ Small buyer info sheet slides up: name, email, order history count.

---

### Discounts Screen

**Discount card — toggle Active/Inactive**
→ Instantly activates or deactivates the discount.

**Discount card — edit icon (tap)**
→ Navigate to edit discount screen (same form, pre-populated)

**"Add Discount" button**
→ Navigate to `AddDiscountScreen`

---

### Buyer Preview Mode (inside Store tab)

**Banner "Viewing as buyer — tap here to return" (tap)**
→ Re-render Store tab back to Manage Mode

**Browsing products in buyer view**
→ All interactions are read-only / cosmetic. No manage controls visible.

---

## ADMIN PANEL (not a tab — stack push from Home gear icon)

### Admin Panel Home Screen

**Back arrow (top left)**
→ Navigate back to `HomeScreen`

**"Onboard New Staff" button (tap)**
→ Navigate to `OnboardStaffScreen`

**Staff row — "Monitor" button (tap)**
→ Navigate to `StaffActivityScreen` for that staff member

**Staff row — three-dot menu (tap)**
→ Action sheet: "Edit staff details" | "Regenerate access code" | "Deactivate account"
→ "Edit staff details" → pre-populated form
→ "Regenerate access code" → shows confirmation: "Regenerate code for [Name]? Their current code [KD-3847] will stop working immediately." → on confirm: generate new code, show it in a modal with a "Copy code" button
→ "Deactivate account" → confirmation modal → on confirm: staff status becomes Inactive. They can no longer log in. Their history is preserved.

**Staff row — avatar (tap)**
→ Same as "Monitor" button

---

### Onboard New Staff Screen

**Full Name input** → text input, required

**Role picker (tap)**
→ Inline segmented control or bottom sheet: "Field Hand" | "Livestock Manager" | "Store Manager" | "Other"
→ If "Store Manager" selected: show a small info note below in Amber: "Store Managers will have access to the Store tab."

**Access Code field**
→ Auto-generates a code on screen load (e.g. "BK-2291"). DM Mono font.

**Regenerate icon (🔄) next to access code field (tap)**
→ Animate a new code appearing with a brief fade/flip transition.

**"Save & Create Profile" button (tap)**
→ Validate name is entered. Save staff record. Navigate back to Admin Panel with new staff visible at top of list. Show toast: "Kofi Boateng has been added to Asante Farms ✓". Code is displayed on the success screen: "Their access code is BK-2291. Share this with them."

---

### Staff Activity Screen

**Back arrow** → navigate back to Admin Panel

**Date filter — "Today" | "This Week" | "This Month" tabs (tap)**
→ Update all stats and lists to reflect the selected time range

**Bar chart (this week's app time — `victory-native`)**
→ Tapping a bar shows a tooltip with the exact minutes for that day

**Task list rows (tap)**
→ Navigate to that `TaskDetailScreen`

**Note rows (tap)**
→ Navigate to that `NoteDetailScreen`

**Comment rows (tap)**
→ Navigate to the `TaskDetailScreen` that contains that comment, scrolled to the comments section

---

## MARKETPLACE SCREENS (Consumer Mode)

### Browse Screen

**Location selector "Ejisu, Ashanti Region ▾" (tap)**
→ Bottom sheet: text input to search for a location or select from a preset list. On change, update ranch results.

**Search bar (tap)**
→ Full-screen search overlay. Recent searches shown below. As user types, show matching products and ranch names. Tap result → navigate to product or ranch.

**Category chip (tap)**
→ Filter the product grid to that category. Active chip filled Rust. Tap active chip again → deselect, show all.

**Featured Ranch card (tap)**
→ Navigate to `RanchProfileScreen`

**Product listing card (tap)**
→ Navigate to `ProductDetailScreen`

**Product listing card — heart icon (tap)**
→ Animate heart icon: scale bounce + fill. Add to Saved list. Brief toast: "Saved to your list". If already saved: unfill heart, remove from saved.

---

### Product Detail Screen

**Photo carousel (swipe left/right)**
→ Swipe through up to 3 product photos. Dot indicators below update.

**Ranch name link (tap)**
→ Navigate to `RanchProfileScreen`

**"About this animal" section (if linked to an animal profile)**
→ Accordion — tap section header to expand/collapse. Shows: Animal ID, DOB, weight, vaccination summary (pulled from medication records). This builds buyer trust.

**"Save" button / heart icon (tap)**
→ Same as card heart — save/unsave

**"Enquire / Order" button (tap)**
→ Bottom sheet slides up: quantity input (if applicable), message field (optional), "Send Enquiry" button. On submit: creates a new Order record with status "Pending". Show success screen: "Your enquiry has been sent to Asante Farms. They will confirm shortly." Back button returns to product.

---

### Ranch Profile Screen (Consumer)

**Back arrow** → navigate back

**Product card in ranch grid (tap)**
→ Navigate to `ProductDetailScreen`

**Star rating / reviews (tap)**
→ Navigate to `ReviewsScreen` (read-only list of past buyer reviews)

---

### Saved Screen

**Saved product card (tap)**
→ Navigate to `ProductDetailScreen`

**Heart icon on saved card (tap)**
→ Unsave with confirmation: "Remove from saved?" (small toast, no modal needed for this) → animate card out with swipe-right fade

---

### Orders Screen (Consumer)

**Order card (tap)**
→ Expand to show full order detail: item list, quantities, total, dispatch notes

**"Contact Ranch" button on order (tap)**
→ Opens a simple message composer sheet. Tap "Send" → creates a direct message to the ranch. (This is a simple in-app message, not SMS.)

---

### Consumer Profile Screen

**Name / Email fields (tap)**
→ Inline editable. Tap to edit, keyboard opens, blur to auto-save.

**"Notification preferences" row (tap)**
→ Navigate to a settings screen with toggles: "Order updates" | "New products from saved ranches" | "Promotions and discounts"

**"Sign out" button (tap)**
→ Confirmation modal: "Sign out of Pocos?" → "Cancel" | "Sign out" → on confirm: clear auth state, navigate to `WelcomeScreen`

---

## GLOBAL BEHAVIOURS

### Back navigation
- All stack screens have a back arrow (left chevron + "Back" or screen name) in the top left
- On Android, hardware back button behaves the same as the back arrow
- If unsaved changes exist on any form screen, back arrow triggers: "Discard changes?" modal

### Toast notifications
- Success toasts: Success Moss background, white text, bottom of screen, auto-dismiss after 2.5 seconds
- Error toasts: Danger Crimson background, white text, same position and timing
- Info toasts (e.g. "Viewing as buyer"): Deep Plum background

### Empty states
Every list screen has an empty state when no data exists:
- `PEmptyState` component: simple icon + title + subtitle + optional CTA button
- Profiles empty: "No animals yet" / "Add your first animal to get started" / "Add Animal" button
- Medication empty: "No medication records" / "All clear for now" / no button
- Tasks empty (Today): "Nothing due today" / "Enjoy the quiet — or create a task" / "Create Task" button
- Chat empty: "No messages yet" / "Start the conversation"
- Orders empty: "No orders yet" / "Your store orders will appear here"

### Loading states
- All list screens show a skeleton loader (grey animated placeholder cards) while data is being fetched from SQLite
- Use `react-native-reanimated` for the shimmer animation on skeletons

### Pull to refresh
- All list screens support pull-to-refresh (React Native `RefreshControl` on `FlatList`)
- Refresh indicator colour: Primary Rust `#C1440E`

### Push notifications (via expo-notifications)
Three notification types are scheduled locally:

1. **Medication wear-off:** Scheduled 24 hours before and again 2 hours before wear-off date. Title: "Medication alert — [Animal Name]". Body: "[Medication name] wears off today at [time]." Tap → opens app to that animal's medication tab.

2. **Task reminder:** Scheduled for the time set on each task. Title: "[Task title]". Body: "Reminder for [Assigned to name] at Asante Farms". Tap → opens task detail screen.

3. **New order (Store):** When a new consumer order is placed (status becomes "Pending"), send a notification to the Super Admin and Store Manager. Title: "New order received". Body: "[Buyer name] ordered [product]". Tap → opens Orders screen.

---

*End of Pocos interactions and sample data prompt. Combined with the main build document, this gives a complete specification for every screen, every button, every data point, and every user interaction in the app.*
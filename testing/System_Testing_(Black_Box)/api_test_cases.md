# 📰 NewsXpress: API Test Case Log

_A well-structured test case document for the NewsXpress backend API._

- **Project:** NewsXpress
- **Feature:** Profile & Bookmark Management
- **Date:** 13-11-2025

## Status Key

| Status | Description |
| :--- | :--- |
| `Pass` | The test case executed and the actual result matched the expected result. |
| `Fail` | The test case executed and the actual result did *not* match the expected result. |
| `Not Run` | The test case has not been executed yet. |

---

## 1. Profile Management

Test cases for the `/api/profiles` endpoints.

| TC ID | Feature | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PROF-API-001** | Create Profile | **Positive:** Create a new profile with all valid data. | 1. Set request to `POST /api/profiles`. <br> 2. Set `Body` to `JSON` with Test Data. <br> 3. Send request. | ```json { "fullName": "Test User", "username": "test_user_01", "authId": "123e4567-e89b-12d3-a456-426614174000" } ``` | 1. Status: `201 Created`. <br> 2. Response body contains the new profile object. <br> 3. Verify data in the `profiles` table. | `Pass` |
| **PROF-API-002** | Update Profile | **Positive:** Update a profile with new preferences. | 1. Get a valid `profile_id` from the database. <br> 2. Set request to `PUT /api/profiles/{id}`. <br> 3. Set `Body` to `JSON` with Test Data. <br> 4. Send request. | ```json { "topic": "Technology", "place": "New York", "actor": ["Tom Hanks"] } ``` | 1. Status: `200 OK`. <br> 2. Response body contains the full profile object with the updated `topic`, `place`, and `actor` fields. <br> 3. Verify data in the `profiles` table. | `Pass` |
| **PROF-API-003** | Get Profile | **Positive:** Get an existing profile by its `id`. | 1. Get a valid `profile_id` from the database. <br> 2. Set request to `GET /api/profiles/{id}`. <br> 3. Send request. | `id` from `PROF-API-001` | 1. Status: `200 OK`. <br> 2. Response body contains the full JSON object for the user. | `Pass` |

---

## 2. Bookmark Management (User Interactions)

Test cases for the `/api/bookmarks` endpoints, which use the `user_interactions` service.

| TC ID | Feature | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BOOK-API-001** | Add Bookmark | **Positive:** Add a new bookmark with a note. | 1. Get a valid `profile_id` and `article_id`. <br> 2. Set request to `POST /api/bookmarks`. <br> 3. Set `Body` to `JSON` with Test Data. <br> 4. Send request. | ```json { "profile_id": "...", "article_id": "...", "note": "This is a great test!" } ``` | 1. Status: `201 Created`. <br> 2. Response body contains the new `user_interaction` object. <br> 3. Verify in `user_interactions` table that `bookmark_timestamp` and `note` are set. | `Pass` |
| **BOOK-API-002** | Get Bookmarks | **Positive:** Get all bookmarks for a user. | 1. Use the `profile_id` from `BOOK-API-001`. <br> 2. Set request to `GET /api/bookmarks/{profileId}`. <br> 3. Send request. | N/A | 1. Status: `200 OK`. <br> 2. Response body is a JSON array. <br> 3. The array contains the interaction from `BOOK-API-001`, including the nested `article` object. | `Pass` |
| **BOOK-API-003** | Remove Bookmark | **Positive:** Remove an existing bookmark. | 1. Use the `profile_id` and `article_id` from `BOOK-API-001`. <br> 2. Set request to `DELETE /api/bookmarks`. <br> 3. Set `Body` to `JSON` with Test Data. <br> 4. Send request. | ```json { "profile_id": "...", "article_id": "..." } ``` | 1. Status: `200 OK`. <br> 2. Response body is `{"message": "Bookmark removed"}`. <br> 3. Verify in `user_interactions` table that `bookmark_timestamp` and `note` are now `null`. | `Pass` |
| **BOOK-API-004** | Add Bookmark | **Negative:** Add a bookmark with missing `article_id`. | 1. Get a valid `profile_id`. <br> 2. Set request to `POST /api/bookmarks`. <br> 3. Set `Body` to `JSON` with Test Data. <br> 4. Send request. | ```json { "profile_id": "..." } ``` | 1. Status: `400 Bad Request`. <br> 2. Response body is `{"message": "profile_id and article_id are required"}`. | `Pass` |

---
## 3. Article & Fetching Endpoints

Test cases for the main article retrieval and saving routes.

| TC ID | Feature | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ART-API-001** | Get Articles | **Positive:** Get a list of general articles. | 1. Set request to `GET /articles`. <br> 2. Send request. | N/A | 1. Status: `200 OK`. <br> 2. Response body is a JSON object containing an `articles` array. <br> 3. The `articles` array is not empty. | `Not Run` |
| **ART-API-002** | Get Articles | **Positive:** Get articles by a specific topic. | 1. Set request to `GET /articles?topic=Technology`. <br> 2. Send request. | `topic=Technology` | 1. Status: `200 OK`. <br> 2. Response body contains an `articles` array. <br> 3. All articles in the array should have `topic: "Technology"`. | `Not Run` |
| **ART-API-003** | Get Summarized | **Positive:** Get summarized news for a category. | 1. Set request to `GET /get-summarized-news/Sports`. <br> 2. Send request. | `category=Sports` | 1. Status: `200 OK`. <br> 2. Response body is a JSON object containing a `summarizedNews` array. <br> 3. The `category` field in the response is "Sports". | `Not Run` |
| **ART-API-004** | Get Summarized | **Negative:** Get news for a category that doesn't exist. | 1. Set request to `GET /get-summarized-news/FakeCategory`. <br> 2. Send request. | `category=FakeCategory` | 1. Status: `404 Not Found`. <br> 2. Response body contains a clear error message (e.g., "No news found..."). | `Not Run` |
| **ART-API-005** | Save Articles | **Positive:** Manually trigger a fetch and save. | 1. Set request to `POST /save-articles`. <br> 2. Send request. | (No body) | 1. Status: `200 OK` (or `201 Created`). <br> 2. Response body contains a JSON summary (e.g., `{"message": "Articles saved...", "saved": X, ...}`). <br> 3. Verify new articles are added to the `articles` table in Supabase. | `Not Run` |
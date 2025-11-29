# Backend Unit Test (White Box) Report

- **Project:** NewsXpress
- **Tool Used:** Jest (The modern industry standard for Node.js, replacing Mocha)

---

## 1. How Unit Testing Was Performed

Unit testing ("White box testing") was implemented by co-locating test files with the source code. Each service file in the `backend/services/` directory has a corresponding `*.test.js` file that tests its functions in isolation.

**Example:**
* `ProfileService.js` (the application code)
* `ProfileService.test.js` (the unit test for that code)

We used Jest's built-in **mocking** functionality to fake database calls. This allows us to test the service's logic without needing a live database connection.

## 2. How to Run Tests

1.  Navigate to the `backend/` folder.
2.  To run all unit tests:
    ```bash
    npm test
    ```
3.  To generate a code coverage report:
    ```bash
    npm run coverage
    ```

## 3. Code Coverage Report

As required, our goal is to achieve 100% code coverage. The report below shows our current progress.

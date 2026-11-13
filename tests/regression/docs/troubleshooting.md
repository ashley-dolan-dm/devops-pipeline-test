# Troubleshooting

| What you see | Likely cause | What to do |
|---|---|---|
| `user hasn't approved this consumer` | The test user is not pre-authorised for the JWT app | Add the user's profile or permission set to the app's policies |
| `invalid_client` or `invalid_client_id` | Wrong consumer key, or a key from another org's app | Check `<WS>_CONSUMER_KEY` matches the app in this org |
| `invalid_grant`, `audience is invalid` | Login URL does not match the org type | `https://test.salesforce.com` for sandboxes, `https://login.salesforce.com` or My Domain for production |
| `<WS>_SF_URL is not set` | No env file for this `TEST_ENV`, or the dotenvx key is missing | Check the file exists and `.env.keys` is present (or the CI secret) |
| Run went to the wrong org | `TEST_ENV` left set from an earlier command | Check with `echo $env:TEST_ENV` (Windows) or `echo $TEST_ENV` (Mac) |
| Seed fails: class not found | The seed class is not deployed to this org | Deploy it through the pipeline |
| Seed passes but nothing is there yet | Async Apex still running | The suite waits for the class's jobs. If you ran it by hand, wait and check Apex Jobs |
| Tests late in a long run land on a login page | The session expired | Sessions are refreshed after 10 minutes. Lower `<WS>_SESSION_MAX_AGE_MS` if the org timeout is shorter |
| A test fails in the full run but passes alone | Two tests change the same record | Give each test its own record, or move them into `journeys/` |
| Some tests are missing from a run | Only the `-chromium` project was chosen | Add the `-serial` project, or run without `--project` |
| A whole serial journey failed after one step | Serial tests stop at the first failure | Fix the first failing step |
| Failures only in one org | The org differs from the one the tests were written against | Note the difference in a comment in the test. Do not add environment branches to make it pass |

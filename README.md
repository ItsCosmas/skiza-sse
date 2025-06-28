# SKIZA POSTBACK SERVER

## Motivation

- A number of scenarios with third party integrations require the need for a web hook to receive the response.
- Case where a certain action is not completed immediately or is asynchronous, some partners opt to send a final response to a web hook.
- For example, [Safaricom Daraja](https://developer.safaricom.co.ke/) sends the final transaction status and info as a postback/callback to a designated http endpoint; 
- Therefore, in development scenarios debugging can be hard as you need to create an internet-reachable http endpoint where you'll receive your postbacks.
- This tool helps you t-shoot this scenario by providing a convenient way for you to quickly receive these postbacks.
- Have your third party send the postbacks to this app via the endpoint `/api/postbacks` and they are streamed real-time to a friendly web UI or Postman Stream where you can inspect and t-shoot.

## Running and Developing locally

```sh
# Terminal 1
cd frontend
npm i
# npm run dev # run the dev server * DONT Use this option
npm run build
npm run preview # test SSE
```

```sh
# Terminal 2
cd backend
mvn spring-boot:run # resolve dependencies and start the spring-boot server
```

## Testing

Access Browser Vite Preview Build at [http://localhost:4173/]( http://localhost:4173/)

![A Screenshot of the Running Frontend on Browser](https://github.com/ItsCosmas/skiza-sse/blob/main/demo/web.png) <br />

Postman/Curl - `curl --location 'localhost:8080/api/postbacks/stream'`

![A Screenshot of testing on Postman](https://github.com/ItsCosmas/skiza-sse/blob/main/demo/postman.png) <br />

Send a sample postback to test

```sh
curl --location 'localhost:8080/api/postbacks' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Hello SSE"
}'
```


## Design

#### Backend

- Spring Webflux
- Two API endpoints `POST /api/postbacks` to receive postback and `GET /api/postbacks/stream` to stream postbacks.
- See [PostbackController.java](https://github.com/ItsCosmas/skiza-sse/blob/main/backend/src/main/java/dev/cozy/skizasse/PostbackController.java) for Implementation.

#### Frontend

- [Daisy UI](https://daisyui.com/)
- [Vite + React TS](https://vite.dev/guide/)
- Browser Support for EventSource
- See [Table.tsx](https://github.com/ItsCosmas/skiza-sse/blob/main/frontend/src/components/table/Table.tsx) for Implementation Logic.

## Gotcha's
You should not perform the browser test using vite dev server `http://localhost:5173/` because of how React `StrictMode` behaves in development. 
Strict Mode will mount, unmount and mount again the Table Component, and therefore connection to SSE will be broken.

## Expose Via NGROK
To receive postbacks on your local setup, you can expose the postback endpoint via NGROK
import { useEffect, useState } from "react";
import Modal from "components/modal/Modal";

const SSE_URL = "http://localhost:8080/api/postbacks/stream";
const eventSource = new EventSource(SSE_URL);

const Table = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [selectedSourceIP, setSelectedSourceIP] = useState("");
    const [selectedResponseBody, setSelectedResponseBody] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    const handleModalOpen = (sourceIP: string, responseBody: string) => {
        setSelectedSourceIP(sourceIP);
        setSelectedResponseBody(responseBody);
        setIsModalOpen(true);
    };

    const handleModalClose = () => setIsModalOpen(false);

    const handleCopyToClipboard = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text); // handle the promise
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1500); // reset after 1.5s
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
        }
    }

    useEffect(() => {

        eventSource.addEventListener("postback", event => {
            console.log("Received SSE:", event.data);
            setMessages((prev) => [...prev, event.data]);
        });

        eventSource.onerror = error => {
            console.error("SSE error:", error);
        };

        return () => {
            eventSource.close();
            console.log("SSE connection closed");
        };
    }, []);

    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra">
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Body</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {/* Map over messages to create a row for each message */}
                {messages.map((message, index) => {
                    // Parse the message as JSON
                    const parsedMessage = JSON.parse(message);
                    // Extract the sourceIP and responseBody
                    const source = parsedMessage.sourceIP || "Unknown";
                    const body = parsedMessage.postbackBody || "No body";

                    return (
                        <tr key={index}>
                            <td>{source}</td>
                            <td>{body}</td>
                            <td className="flex justify-normal">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6 cursor-pointer"
                                    onClick={() => handleModalOpen(source, body)}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                </svg>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke={copiedIndex === index ? "green" : "currentColor"}
                                    className="size-6 cursor-pointer ml-6"
                                    onClick={()=>handleCopyToClipboard(body,index)}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                                    />
                                </svg>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <Modal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                sourceIP={selectedSourceIP}
                responseBody={selectedResponseBody}
            />
        </div>
    );
};

export default Table;


import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AITutor() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/ai-tutor/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: userQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to get AI response"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer ||
            data.response ||
            "AI could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI Tutor error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tutor-page">

      <div className="ai-tutor-container">

      <button
  className="back-to-dashboard"
  onClick={() => navigate("/")}
>
  ← Back to Dashboard
</button>

        <div className="ai-tutor-header">
          <div className="ai-tutor-icon">
            🤖
          </div>

          <div>
            <h1>AI Tutor</h1>
            <p>
              Ask questions and get help with your learning.
            </p>
          </div>
        </div>

        <div className="ai-chat">

          {messages.length === 0 ? (
            <div className="ai-empty">

              <div className="ai-empty-icon">
                🧠
              </div>

              <h2>
                How can I help you?
              </h2>

              <p>
                Ask me anything about your courses,
                lessons, programming, or concepts you're
                learning.
              </p>

            </div>
          ) : (
            <div className="messages">

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.role === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >

                  <div className="message-avatar">
                    {message.role === "user"
                      ? "A"
                      : "🤖"}
                  </div>

                  <div className="message-content">
  <strong>
    {message.role === "user" ? "You" : "AI Tutor"}
  </strong>

  <div className="markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {message.content}
    </ReactMarkdown>
  </div>
</div>
                  </div>

                
              ))}

              {loading && (
                <div className="message ai-message">

                  <div className="message-avatar">
                    🤖
                  </div>

                  <div className="message-content">

                    <strong>
                      AI Tutor
                    </strong>

                    <p>
                      Thinking...
                    </p>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        <form
          className="ai-input-area"
          onSubmit={handleAsk}
        >

          <input
            type="text"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Ask your AI Tutor something..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading || !question.trim()
            }
          >
            {loading ? "..." : "Send →"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AITutor;
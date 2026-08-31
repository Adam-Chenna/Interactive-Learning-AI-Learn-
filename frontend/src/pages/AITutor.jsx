import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// AUTH HELPER
// =====================================================

const getToken = () => {
  const token = localStorage.getItem("access_token");

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
};


// =====================================================
// AI TUTOR
// =====================================================

function AITutor() {

  const navigate = useNavigate();

  // ===================================================
  // CHAT
  // ===================================================

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===================================================
  // CONVERSATION
  // ===================================================

  const [conversationId, setConversationId] = useState(null);

  // ===================================================
  // HISTORY
  // ===================================================

  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ===================================================
  // DELETE
  // ===================================================

  const [deletingId, setDeletingId] = useState(null);

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] = useState("");

  // =====================================================
  // API CONFIG CHECK
  // =====================================================

  useEffect(() => {

    console.log("================================");
    console.log("AI TUTOR API URL:", API_URL);
    console.log("================================");

    if (!API_URL) {

      setError(
        "VITE_API_URL is not configured. Check frontend/.env and restart Vite."
      );

    }

  }, []);


  // =====================================================
  // AUTH ERROR
  // =====================================================

  const handleAuthError = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");

    navigate("/login", {
      replace: true,
    });

  };


  // =====================================================
  // SAFE JSON RESPONSE
  // =====================================================

  const getResponseData = async (response) => {

    const text = await response.text();

    if (!text) {
      return {};
    }

    try {

      return JSON.parse(text);

    } catch {

      return {
        detail: text,
      };

    }

  };


  // =====================================================
  // LOAD CHAT HISTORY
  // =====================================================

  const loadConversations = async () => {

    const token = getToken();

    if (!token) {

      handleAuthError();

      return;

    }

    if (!API_URL) {

      setError(
        "API URL is missing. Check frontend/.env."
      );

      return;

    }

    try {

      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/api/ai-tutor/conversations`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },

        }
      );


      if (response.status === 401) {

        handleAuthError();

        return;

      }


      const data =
        await getResponseData(response);


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to load chat history."
        );

      }


      setConversations(
        Array.isArray(data.conversations)
          ? data.conversations
          : []
      );


    } catch (error) {

      console.error(
        "CHAT HISTORY ERROR:",
        error
      );

      setError(
        error.message ||
        "Could not load chat history."
      );

    } finally {

      setHistoryLoading(false);

    }

  };


  // =====================================================
  // LOAD HISTORY WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    loadConversations();

  }, []);


  // =====================================================
  // LOAD SINGLE CONVERSATION
  // =====================================================

  const loadConversation = async (id) => {

    const token = getToken();

    if (!token) {

      handleAuthError();

      return;

    }


    try {

      setLoading(true);
      setError("");


      const response = await fetch(
        `${API_URL}/api/ai-tutor/conversations/${id}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },

        }
      );


      if (response.status === 401) {

        handleAuthError();

        return;

      }


      const data =
        await getResponseData(response);


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to load conversation."
        );

      }


      setConversationId(
        data.conversation_id
      );


      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : []
      );


    } catch (error) {

      console.error(
        "LOAD CONVERSATION ERROR:",
        error
      );

      setError(
        error.message ||
        "Could not load conversation."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // NEW CHAT
  // =====================================================

  const handleNewChat = () => {

    setConversationId(null);

    setMessages([]);

    setQuestion("");

    setError("");

  };


  // =====================================================
  // ASK AI
  // =====================================================

  const handleAsk = async (e) => {

    e.preventDefault();


    if (
      !question.trim() ||
      loading
    ) {

      return;

    }


    const userQuestion =
      question.trim();


    const token = getToken();


    // ---------------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------------

    if (!token) {

      handleAuthError();

      return;

    }


    // ---------------------------------------------------
    // API CHECK
    // ---------------------------------------------------

    if (!API_URL) {

      setError(
        "VITE_API_URL is missing. Check frontend/.env."
      );

      return;

    }


    // ---------------------------------------------------
    // CLEAR OLD ERROR
    // ---------------------------------------------------

    setError("");


    // ---------------------------------------------------
    // CLEAR INPUT
    // ---------------------------------------------------

    setQuestion("");


    // ---------------------------------------------------
    // SHOW USER MESSAGE
    // ---------------------------------------------------

    setMessages((prev) => [

      ...prev,

      {
        role: "user",
        content: userQuestion,
      },

    ]);


    setLoading(true);


    try {

      // =================================================
      // REQUEST BODY
      // =================================================

      const requestBody = {

        question: userQuestion,

      };


      // -------------------------------------------------
      // CONTINUE EXISTING CHAT
      // -------------------------------------------------

      if (
        conversationId !== null &&
        conversationId !== undefined
      ) {

        requestBody.conversation_id =
          conversationId;

      }


      console.log(
        "AI REQUEST:",
        requestBody
      );


      // =================================================
      // SEND REQUEST
      // =================================================

      const response = await fetch(
        `${API_URL}/api/ai-tutor/ask`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify(
              requestBody
            ),

        }
      );


      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        response.status === 401
      ) {

        handleAuthError();

        return;

      }


      // =================================================
      // RESPONSE
      // =================================================

      const data =
        await getResponseData(response);


      console.log(
        "AI RESPONSE:",
        data
      );


      // =================================================
      // BACKEND ERROR
      // =================================================

      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.message ||
          "AI Tutor could not generate a response."
        );

      }


      // =================================================
      // CONVERSATION ID
      // =================================================

      if (
        data.conversation_id !==
          undefined &&
        data.conversation_id !==
          null
      ) {

        setConversationId(
          data.conversation_id
        );

      }


      // =================================================
      // AI ANSWER
      // =================================================

      const aiAnswer =
        data.answer ||
        data.response;


      if (!aiAnswer) {

        throw new Error(
          "Backend response did not contain an AI answer."
        );

      }


      // =================================================
      // ADD AI MESSAGE
      // =================================================

      setMessages((prev) => [

        ...prev,

        {
          role: "assistant",
          content: aiAnswer,
        },

      ]);


      // =================================================
      // REFRESH CHAT HISTORY
      // =================================================

      await loadConversations();


    } catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "AI TUTOR ERROR:",
        error
      );

      console.error(
        "================================"
      );


      // -------------------------------------------------
      // SHOW ACTUAL ERROR
      // -------------------------------------------------

      setError(
        error.message ||
        "AI Tutor could not generate a response."
      );


      // -------------------------------------------------
      // SHOW ERROR INSIDE CHAT
      // -------------------------------------------------

      setMessages((prev) => [

        ...prev,

        {
          role: "assistant",

          content:
            `⚠️ ${error.message || "AI Tutor could not generate a response."}`,

        },

      ]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // DELETE CONVERSATION
  // =====================================================

  const handleDeleteConversation = async (id) => {

    const token = getToken();


    if (!token) {

      handleAuthError();

      return;

    }


    try {

      setDeletingId(id);


      const response =
        await fetch(
          `${API_URL}/api/ai-tutor/conversations/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

          }
        );


      if (
        response.status === 401
      ) {

        handleAuthError();

        return;

      }


      const data =
        await getResponseData(response);


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to delete conversation."
        );

      }


      // -------------------------------------------------
      // REMOVE FROM SIDEBAR
      // -------------------------------------------------

      setConversations(
        (prev) =>
          prev.filter(
            (conversation) =>
              conversation.id !== id
          )
      );


      // -------------------------------------------------
      // IF CURRENT CHAT DELETED
      // -------------------------------------------------

      if (
        conversationId === id
      ) {

        handleNewChat();

      }


    } catch (error) {

      console.error(
        "DELETE CONVERSATION ERROR:",
        error
      );


      setError(
        error.message ||
        "Could not delete conversation."
      );

    } finally {

      setDeletingId(null);

    }

  };


  // =====================================================
  // CONVERSATION TITLE
  // =====================================================

  const getConversationTitle =
    (conversation) => {

      if (
        conversation.title
      ) {

        return conversation.title;

      }


      return `Conversation #${conversation.id}`;

    };


  // =====================================================
  // USER NAME
  // =====================================================

  const userName =
    localStorage.getItem(
      "user_name"
    ) || "Student";


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="ai-tutor-page">

      <div className="ai-tutor-container">


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          className="back-to-dashboard"
          onClick={() =>
            navigate("/")
          }
          type="button"
        >

          ← Back to Dashboard

        </button>


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="ai-tutor-header">

          <div className="ai-tutor-icon">
            🤖
          </div>

          <div>

            <h1>
              AI Tutor
            </h1>

            <p>
              Ask questions and continue your
              learning conversation.
            </p>

          </div>

        </div>


        {/* =================================================
            CHAT LAYOUT
        ================================================= */}

        <div className="ai-chat-layout">


          {/* =================================================
              HISTORY SIDEBAR
          ================================================= */}

          <aside className="chat-history">


            {/* SIDEBAR HEADER */}

            <div className="chat-history-header">

              <div>

                <strong>
                  Chat History
                </strong>

                <span>
                  Your conversations
                </span>

              </div>


              <button
                type="button"
                className="new-chat-btn"
                onClick={
                  handleNewChat
                }
              >

                + New Chat

              </button>

            </div>


            {/* HISTORY LIST */}

            <div className="chat-history-list">


              {historyLoading ? (

                <div className="history-loading">

                  Loading chats...

                </div>

              ) : conversations.length === 0 ? (

                <div className="history-empty">

                  <div>
                    💬
                  </div>

                  <p>
                    No previous conversations
                  </p>

                  <span>
                    Start a new chat with your AI Tutor.
                  </span>

                </div>

              ) : (

                conversations.map(
                  (conversation) => (

                    <div
                      key={
                        conversation.id
                      }
                      className={
                        `history-item ${
                          conversationId ===
                          conversation.id
                            ? "history-item-active"
                            : ""
                        }`
                      }
                    >


                      {/* OPEN */}

                      <button
                        type="button"
                        className="history-chat-btn"
                        onClick={() =>
                          loadConversation(
                            conversation.id
                          )
                        }
                      >

                        <span className="history-chat-icon">
                          💬
                        </span>

                        <span className="history-chat-title">

                          {getConversationTitle(
                            conversation
                          )}

                        </span>

                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="delete-chat-btn"
                        onClick={() =>
                          handleDeleteConversation(
                            conversation.id
                          )
                        }
                        disabled={
                          deletingId ===
                          conversation.id
                        }
                        title="Delete conversation"
                      >

                        {deletingId ===
                        conversation.id
                          ? "..."
                          : "🗑"}

                      </button>

                    </div>

                  )
                )

              )}

            </div>

          </aside>


          {/* =================================================
              CHAT AREA
          ================================================= */}

          <div className="ai-chat">


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="ai-chat-error">

                {error}

              </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {messages.length === 0 ? (

              <div className="ai-empty">

                <div className="ai-empty-icon">
                  🧠
                </div>


                <h2>

                  How can I help you,{" "}
                  {userName}?

                </h2>


                <p>

                  Ask me anything about your courses,
                  lessons, programming, or concepts
                  you're learning.

                </p>


                <div className="ai-suggestions">


                  <button
                    type="button"
                    onClick={() =>
                      setQuestion(
                        "Explain Python variables in simple words."
                      )
                    }
                  >

                    Explain Python variables

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setQuestion(
                        "What is an API and how does it work?"
                      )
                    }
                  >

                    Explain APIs

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setQuestion(
                        "Help me understand React components."
                      )
                    }
                  >

                    Explain React

                  </button>


                </div>

              </div>

            ) : (

              /* =================================================
                 MESSAGES
              ================================================= */

              <div className="messages">

                {messages.map(
                  (
                    message,
                    index
                  ) => (

                    <div
                      key={
                        message.id ||
                        `${message.role}-${index}`
                      }
                      className={
                        `message ${
                          message.role ===
                          "user"
                            ? "user-message"
                            : "ai-message"
                        }`
                      }
                    >


                      {/* AVATAR */}

                      <div className="message-avatar">

                        {message.role ===
                        "user"
                          ? userName
                              .charAt(0)
                              .toUpperCase()
                          : "🤖"}

                      </div>


                      {/* CONTENT */}

                      <div className="message-content">

                        <strong>

                          {message.role ===
                          "user"
                            ? "You"
                            : "AI Tutor"}

                        </strong>


                        <div className="markdown-content">

                          <ReactMarkdown
                            remarkPlugins={[
                              remarkGfm,
                            ]}
                          >

                            {
                              message.content
                            }

                          </ReactMarkdown>

                        </div>

                      </div>

                    </div>

                  )
                )}


                {/* =================================================
                    THINKING
                ================================================= */}

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

        </div>


        {/* =================================================
            INPUT
        ================================================= */}

        <form
          className="ai-input-area"
          onSubmit={
            handleAsk
          }
        >

          <input
            type="text"
            value={question}
            onChange={(e) => {

              setQuestion(
                e.target.value
              );

              if (error) {
                setError("");
              }

            }}
            placeholder="Ask your AI Tutor something..."
            disabled={loading}
          />


          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
          >

            {loading
              ? "..."
              : "Send →"}

          </button>

        </form>


        {/* =================================================
            CURRENT CHAT
        ================================================= */}

        {conversationId && (

          <div className="current-chat-info">

            💬 Conversation #{conversationId}

          </div>

        )}

      </div>

    </div>

  );

}

export default AITutor;
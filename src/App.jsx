import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields");
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUserEmail(email);
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || !sendAt) return alert("All fields are required");
    try {
      await axios.post(
        `${API_BASE}/events`,
        { message, send_at: sendAt, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("");
      setSendAt("");
      fetchEvents();
    } catch (err) {
      alert("Failed to schedule event");
    }
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail("");
  };

  return (
    <div className="container">
      {!token ? (
        <div className="login-container">
          <h2>Login to Schedule Events</h2>
          <form onSubmit={handleLogin} className="form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <>
          <div className="logbtndiv">
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="header">
            <h1>Event Scheduler</h1>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="datetime-local"
              value={sendAt}
              onChange={(e) => setSendAt(e.target.value)}
            />
            <button type="submit">Schedule Message</button>
          </form>

          <h2>Scheduled Events</h2>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Message</th>
                  <th>Send At</th>
                  <th>Status</th>
                  <th>Retries</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.message}</td>
                    <td>{new Date(event.send_at).toLocaleString()}</td>
                    <td>{event.status}</td>
                    <td>{event.retries}</td>
                    <td>{event.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;

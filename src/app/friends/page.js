"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { SocketContext } from "../../contexts/SocketContext";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [name, setName] = useState("");
  const socket = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);

  const handleFriendRequest = (event) => {
    event.preventDefault();

    const access_token = Cookies.get("access_token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/add?name=${name}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        toast.success("친구 요청을 보냈습니다.");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleFriendRequestAccept = (requestId) => {
    const access_token = Cookies.get("access_token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/request/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        toast.success("친구 요청을 승락했습니다.");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleFriendRequestReject = (requestId) => {
    const access_token = Cookies.get("access_token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/request/${requestId}/decline`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        toast.success("친구 요청을 거절했습니다.");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleFriendDelete = (name) => {
    const access_token = Cookies.get("access_token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/delete/?name=${name}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        toast.success("친구를 삭제했습니다.");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleCreateDM = (friendId) => {
    const access_token = Cookies.get("access_token");

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/create/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        toast.success("DM을 만들었습니다.");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  useEffect(() => {
    const access_token = Cookies.get("access_token");
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((response) => {
        const data = response.data;

        const fetchUserInfosPromises = data.map((friendData) => {
          return axios
            .get(
              `${process.env.NEXT_PUBLIC_API_URL}/users/${friendData.friend_id}`,
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              }
            )
            .then((userInfoResponse) => userInfoResponse.data);
        });

        return Promise.all(fetchUserInfosPromises);
      })
      .then((usersData) => {
        setFriends(usersData);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const access_token = Cookies.get("access_token");

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/friends/requests`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((response) => {
        const requests = response.data;

        const fetchUserInfosPromises = requests.map((request) => {
          return axios
            .get(
              `${process.env.NEXT_PUBLIC_API_URL}/users/${request.sender_id}`,
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              }
            )
            .then((userInfoResponse) => {
              return {
                id: request.id,
                userData: userInfoResponse.data,
              };
            });
        });

        return Promise.all(fetchUserInfosPromises);
      })
      .then((usersDataWithIds) => {
        setFriendRequests(usersDataWithIds);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("notification", (message) => {
  //       setNotifications((prev) => [...prev, message]);
  //     });
  //   }

  //   return () => {
  //     if (socket) {
  //       socket.off("notification");
  //     }
  //   };
  // }, [socket]);

  console.log(notifications);
  return (
    <div>
      <ToastContainer />
      <h1>친구 목록</h1>
      <ul>
        {friends &&
          friends.length > 0 &&
          friends.map((friend) => (
            <li key={friend.name}>
              <span>{friend.name}</span>
              <button onClick={() => handleFriendDelete(friend.name)}>
                삭제
              </button>
              <button onClick={() => handleCreateDM(friend.id)}>
                채팅 만들기
              </button>
            </li>
          ))}
      </ul>
      <h1>친구 요청 목록</h1>
      <ul>
        {friendRequests &&
          friendRequests.length > 0 &&
          friendRequests.map((friendRequest) => (
            <li key={friendRequest.userData.name}>
              <span>{friendRequest.userData.name}</span>
              <button
                onClick={() => handleFriendRequestAccept(friendRequest.id)}
              >
                수락
              </button>
              <button
                onClick={() => handleFriendRequestReject(friendRequest.id)}
              >
                거절
              </button>
            </li>
          ))}
      </ul>
      <h1>친구 요청</h1>
      <form onSubmit={handleFriendRequest}>
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

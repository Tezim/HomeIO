import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import RoomSettings from "../components/RoomSettings";
import AppliancesSettings from "../components/AppliancesSettings";
import { useNavigate } from "react-router-dom";
import CustomLoading from "../components/custom/CustomLoading";
import { isAuthenticated } from "../components/helpers/Helpers";
import { addRoomToDb, getRoomsFromDb } from "../services/RoomsService";
import {
  addDeviceToDb,
  getDevicesForRoom,
  getDevicesFromDb,
} from "../services/DevicesService";
import { getCategoriesFromDb } from "../services/CategoriesService";
import AddRoomModal from "../components/modals/AddRoomModal";
import AddDeviceModal from "../components/modals/AddDeviceModal";

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState();
  const [loading, setLoading] = useState(false);
  const [showAddRoomModal, setAddRoomModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const history = useNavigate();
  const authenticated = isAuthenticated();

  const getRooms = () => {
    getRoomsFromDb()
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => console.log(error));
  };

  const getCategories = () => {
    getCategoriesFromDb().then((response) => {
      setCategories(response.data);
    });
  };

  const getDevices = () => {
    getDevicesFromDb()
      .then((response) => {
        setDevices(response.data);
      })
      .catch((error) => console.log(error));
  };

  const getDevicesRoom = () => {
    getDevicesForRoom(selectedRoom?.room_id)
      .then((response) => setDevices(response.data))
      .catch((error) => console.log(error));
  };

  const addRoom = (room) => {
    setLoading(true);
    addRoomToDb(room)
      .then(getRooms)
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  const addDevice = (device) => {
    setLoading(true);
    addDeviceToDb(device)
      .then(getDevicesRoom)
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSelectedRoom(rooms[0]);
  }, [rooms]);

  useEffect(() => {
    getDevicesRoom();
  }, [selectedRoom]);

  useEffect(() => {
    if (!authenticated) {
      history("/");
    } else {
      let promises = [];
      promises.push(getRooms());
      promises.push(getCategories());
      setLoading(true);
      Promise.all(promises).then(() => setLoading(false));
    }
  }, [authenticated, history]);

  if (loading) {
    return <CustomLoading />;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AddRoomModal
        show={showAddRoomModal}
        onClose={() => setAddRoomModal(false)}
        onSubmit={(room) => addRoom(room)}
      />
      <AddDeviceModal
        show={showAddDeviceModal}
        rooms={rooms}
        categories={categories}
        selectedRoom={selectedRoom}
        onClose={() => setShowAddDeviceModal(false)}
        onSubmit={(device) => addDevice(device)}
      />
      <div
        style={{
          display: authenticated ? "flex" : "none",
          flexDirection: "column",
          flexGrow: 1,
          backgroundColor: "#1f1f1f",
          borderRadius: "15px",
          padding: "5px",
          margin: "10px",
          maxWidth: "75vw",
        }}
      >
        <PageHeader
          headerText={"Summary"}
          button={{
            event: () => setAddRoomModal(true),
            text: "Add room",
          }}
        />
        <div
          style={{
            display: "flex",
            margin: "5px 0px 0px 10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex" }}>
            {rooms.map((r, i) => {
              return (
                <div
                  style={{
                    cursor: "pointer",
                    marginRight: "20px",
                    color: selectedRoom?.name === r.name ? "white" : "#858483",
                    borderBottom:
                      selectedRoom?.name === r.name
                        ? "1px solid orange"
                        : "inherit",
                  }}
                  onClick={() => setSelectedRoom(r)}
                  key={i}
                >
                  {r.name}
                </div>
              );
            })}
          </div>
          <button
            style={{
              borderRadius: "10px",
              border: "none",
              backgroundColor: "orange",
              fontFamily: "inherit",
              fontSize: "15px",
              padding: "3px 8px 3px 8px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Customize
              <img
                src={"/equalizer.png"}
                style={{ width: "20px", height: "20px", marginLeft: "10px" }}
                alt={"customize"}
              />
            </div>
          </button>
        </div>
        <RoomSettings categories={categories} />
        <PageHeader headerText={"Quick use"} />
        <AppliancesSettings
          appliances={devices}
          onButtonClick={() => setShowAddDeviceModal(true)}
        />
      </div>
    </div>
  );
};

export default HomePage;

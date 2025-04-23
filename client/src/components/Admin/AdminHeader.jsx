import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Badge, Offcanvas } from "react-bootstrap";
import { useWindowSize } from "react-use";
import Logo from "../../assets/SDO_Logo1.png";
import { LuTickets } from "react-icons/lu";
import { FaRegUser, FaBoxOpen } from "react-icons/fa";
import { BiUserPlus } from "react-icons/bi";
import { MdOutlineRestartAlt } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import Swal from "sweetalert2";
import { MdAddChart } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";

const AdminHeader = ({ 
  firstName, 
  lastName, 
  username, 
  role, 
  activeTab, 
  setActiveTab 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { width } = useWindowSize();
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (width < 768 && showSidebar && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar, width]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (width >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      }
    });
  };

  const handleCreateBatch = () => {
    navigate("/createbatch");
  };

  const handleCreateBatch2 = () => {
    navigate("/batchcreate");
  };

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100" ref={sidebarRef}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="d-flex">
          <img
            alt="Logo"
            src={Logo}
            className="schoolLogo"
            style={{width: '40px'}}
          />
          <h5 className="mt-2 ms-2">SDO Cabuyao</h5>
        </div>
        <div className="">
          <FaRegUser className="m-auto mt-4 my-2" style={{fontSize: '60px'}}/>
          <p className="text-secondary text-center mt-4 fs-6">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-grow-1">
        <div className="nav flex-column">
          
          {/* Support Tickets */}
          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'tickets' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <LuTickets className="me-3 fs-5 " />
            Tickets
          </button>
          
          {/* New Account Requests */}
          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'newAccounts' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('newAccounts')}
          >
            <BiUserPlus className="me-3 fs-5" />
            New Account Requests
          </button>
          
          {/* Reset Account Requests */}
          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'resetAccounts' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('resetAccounts')}
          >
            <MdOutlineRestartAlt className="me-3 fs-5" />
            Reset Account Requests
          </button>

          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'batchCreate' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('batchCreate')}
          >
            <FaBoxOpen className="me-3 fs-5" />
            Create Batch
          </button>

          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'viewBatches' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('viewBatches')}
          >
            <CiViewList className="me-3 fs-5" />
            View Batch
          </button>

          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'issues' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <MdAddChart className="me-3 fs-5" />
            Manage Issue
          </button>

          <button
            className={`nav-link text-dark d-flex align-items-center py-3 px-1 hover-effect border-0 bg-transparent w-100 text-start ${activeTab === 'adminchangepass' ? 'active-nav-item' : ''}`}
            onClick={() => setActiveTab('adminchangepass')}
          >
            <IoKeyOutline className="me-3 fs-5" />
            Change Password
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-top pt-3">
        <div className="d-flex align-items-center mb-3">
          <div className="me-2">
            <small className="text-muted">Logged in as:</small>
            <div className="fw-bold">{firstName} {lastName}</div>
          </div>
        </div>
        <button
          className="btn btn-dark w-100 logout-btn"
          onClick={handleLogout}
          style={{ backgroundColor: "#294a70", border: 'none'}}
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          .hover-effect {
            transition: all 0.2s ease-in-out;
          }
          
          .hover-effect:hover {
            background-color: rgba(41, 74, 112, 0.1);
            border-radius: 4px;
          }

          .active-nav-item {
            background-color: rgba(41, 74, 112, 0.1);
            border-radius: 4px;
            font-weight: bold;
          }

          .logout-btn:hover {
            background-color: #1c3655 !important;
          }

          @media (min-width: 768px) {
            .main-content {
              margin-left: 250px;
              transition: margin-left 0.3s ease-in-out;
            }
          }
        `}
      </style>

      {/* Desktop Sidebar */}
      {width >= 768 && (
        <div
          className="sidebar position-fixed bg-white"
          style={{
            top: 0,
            left: 0,
            width: "250px",
            height: "100vh",
            padding: "15px",
            color: "#294a70",
            zIndex: 1000,
            boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)",
            overflowY: "auto"
          }}
        >
          <SidebarContent />
        </div>
      )}

      {/* Navbar */}
      <nav
        className="navbar navbar-dark fixed-top"
        style={{
          backgroundColor: "#294a70",
          marginLeft: width >= 768 ? "250px" : "0",
          zIndex: 500,
          transition: "margin-left 0.3s ease-in-out"
        }}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            {width < 768 && (
              <button
                className="navbar-toggler me-2"
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            )}
            <a className="navbar-brand" href="#">
            <b className="d-none d-lg-inline">{firstName} {lastName}</b>
              <span className="fs-6 ms-lg-4 ms-0 d-lg-inline">
                <i className="d-none d-lg-inline">Username: {username}</i>
                <Badge bg="light" className="ms-3" style={{ color: "#294a70" }}>
                  {role}
                </Badge>
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Offcanvas
        show={showSidebar && width < 768}
        onHide={() => setShowSidebar(false)}
        placement="start"
        backdrop={true}
        style={{ 
          width: "250px", 
          boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)",
          border: "none"
        }}
      >
        <Offcanvas.Body className="">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AdminHeader;
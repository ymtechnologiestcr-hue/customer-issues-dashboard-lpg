import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  assignComplaintToDeliveryBoy,
  createPenalty,
  createComplaint,
  createCustomerTransfer,
  createNewConnection,
  createNameChangeRequest,
  fetchRecentPenalties,
  fetchComplaints,
  fetchComplaintDrivers,
  fetchCustomers,
  fetchDashboardOverview,
  fetchRecentConnections,
  fetchRecentNameChanges,
  fetchRecentTransfers,
  lookupPenaltyCustomer,
  lookupNameChangeCustomer,
  lookupTransferCustomer,
  markPenaltyPaid,
  updateComplaintStatus,
  updateNameChangeApprovalStatus,
  uploadSupportingDocument,
  searchConnectionProducts,
  fetchPrStockSummary,
  fetchSalesReport,
  fetchCustomerMovementReport,
  fetchComplaintsReport,
  fetchOtpVerificationReport,
} from "./services/complaintsApi";
import {
  addIocOtpManual,
  fetchCustomerDashboardDetails,
  fetchCustomerDirectory,
  fetchIocOtpSummary,
  fetchIocOtps,
  markOtpSent,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from "./services/complaintsApi";
import Login from "./components/Login";
import BulkCustomerUpload from "./components/BulkCustomerUpload";

const SIDEBAR_ITEMS = [
  "Dashboard",
  "Complaints",
  "New Connection",
  "Transfer",
  "Name Change",
  "PR Penalty",
  "IOC OTPs",
  "Customers",
  "Reports",
];

const SIDEBAR_ICONS = {
  Dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
      <rect width="7" height="5" x="3" y="16" rx="1"></rect>
    </svg>
  ),
  Complaints: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  ),
  "New Connection": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
      <path d="m2 22 3-3"></path>
      <path d="M7.5 13.5 10 11"></path>
      <path d="M10.5 16.5 13 14"></path>
      <path d="m18 3-4 4h6l-4 4"></path>
    </svg>
  ),
  Transfer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3 4 7l4 4"></path>
      <path d="M4 7h16"></path>
      <path d="m16 21 4-4-4-4"></path>
      <path d="M20 17H4"></path>
    </svg>
  ),
  "Name Change": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11.5 15H7a4 4 0 0 0-4 4v2"></path>
      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"></path>
      <circle cx="10" cy="7" r="4"></circle>
    </svg>
  ),
  "PR Penalty": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
      <path d="M8 8h8"></path>
      <path d="M8 12h8"></path>
      <path d="m13 17-5-1h1a4 4 0 0 0 0-8"></path>
    </svg>
  ),
  "IOC OTPs": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
    </svg>
  ),
  Customers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <circle cx="9" cy="7" r="4"></circle>
    </svg>
  ),
  Reports: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
      <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
      <path d="M8 18v-2"></path>
      <path d="M12 18v-4"></path>
      <path d="M16 18v-6"></path>
    </svg>
  ),
};

const DASHBOARD_CARD_ICONS = {
  pendingComplaints: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  ),
  leakageComplaints: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path>
    </svg>
  ),
  newConnections: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
      <path d="m2 22 3-3"></path>
      <path d="M7.5 13.5 10 11"></path>
      <path d="M10.5 16.5 13 14"></path>
      <path d="m18 3-4 4h6l-4 4"></path>
    </svg>
  ),
  transferRequests: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3 4 7l4 4"></path>
      <path d="M4 7h16"></path>
      <path d="m16 21 4-4-4-4"></path>
      <path d="M20 17H4"></path>
    </svg>
  ),
  nameChangeRequests: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11.5 15H7a4 4 0 0 0-4 4v2"></path>
      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"></path>
      <circle cx="10" cy="7" r="4"></circle>
    </svg>
  ),
  pendingManagerVerification: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  ),
};

const ISSUE_OPTIONS = [
  { value: "LEAKAGE", label: "Leakage" },
  { value: "CYLINDER_NOT_RECEIVED", label: "Cylinder Not Received" },
  { value: "BOOKING_DELAY", label: "Booking Delay" },
  { value: "METER_ISSUE", label: "Meter Issue" },
];

const DEFAULT_NEW_CONNECTION_FORM = {
  customerName: "",
  mobileNumber: "",
  consumerNumber: "",
  address: "",
  idProofDetails: "",
  idProofUrl: "",
  idProofLabel: "",
  productDetails: "",
  productId: null,
  selectedProducts: [],
  depositAmount: "",
  gstAmount: "",
};

const DEFAULT_TRANSFER_FORM = {
  consumerNumber: "",
  existingName: "",
  existingCustomerId: null,
  existingCustomerPhone: "",
  existingCustomerAddress: "",
  existingProductDetails: "",
  newCustomerName: "",
  newCustomerMobile: "",
  newCustomerAddress: "",
  depositLiability: "",
  reason: "",
  isRegulatorReceived: false,
  emptyProductId: null,
  emptyProductName: "",
  emptyCylinderQty: "",
};

const DEFAULT_NAME_CHANGE_FORM = {
  consumerNumber: "",
  existingName: "",
  existingCustomerId: null,
  existingCustomerPhone: "",
  existingCustomerAddress: "",
  newName: "",
  serviceFee: "50",
  isSameAddress: true,
  newAddress: "",
  documentUrl: "",
  documentLabel: "",
};

const DEFAULT_PR_PENALTY_FORM = {
  consumerNumber: "",
  customerName: "",
  customerId: null,
  transactionType: "REPLACEMENT",
  quantity: "1",
  penaltyReason: "Defective PR replacement",
  penaltyAmount: "0",
};

const normalizeStatus = (status) => String(status || "PENDING").replaceAll("_", " ");

const normalizeIssueLabel = (issue) => {
  const map = {
    LEAKAGE: "Leakage",
    CYLINDER_NOT_RECEIVED: "Cylinder Not Received",
    BOOKING_DELAY: "Booking Delay",
    METER_ISSUE: "Meter Issue",
  };

  return map[issue] || String(issue || "Issue").replaceAll("_", " ");
};

const getDaysAgo = (value) => {
  if (!value) return "Today";

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "Today";

  const diff = Date.now() - createdAt.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`;
};

const toText = (value) => (value == null ? "" : String(value));

const getDashboardStatusClass = (status) => {
  const text = String(status || "PENDING").toUpperCase().replaceAll("_", " ");
  if (text.includes("ASSIGNED")) return "assigned";
  if (text.includes("IN PROGRESS")) return "in-progress";
  if (text.includes("RESOLVED") || text.includes("CLOSED") || text.includes("PAID")) return "resolved";
  return "pending";
};

const mapTransferLookup = (record) => {
  if (!record) return null;

  return {
    existingCustomerId: record.existing_customer_id || record.customer_id || record.id || null,
    existingName: record.name || record.existing_name || record.customer_name || record.customerName || "",
    existingCustomerPhone: record.existing_phone || record.phone || record.mobile_number || "",
    existingCustomerAddress: record.address || record.customer_address || "",
    existingProductDetails:
      record.existing_product_details || record.product_details || record.connection_details || record.items || "",
    ...(record.depositLiability !== undefined && record.depositLiability !== null
      ? { depositLiability: String(record.depositLiability) }
      : record.deposit_liability !== undefined && record.deposit_liability !== null
      ? { depositLiability: String(record.deposit_liability) }
      : {}),
  };
};

const mapNameChangeLookup = (record) => {
  if (!record) return null;

  return {
    existingCustomerId: record.existing_customer_id || record.customer_id || record.id || null,
    existingName: record.name || record.existing_name || record.customer_name || record.customerName || "",
    existingCustomerPhone: record.existing_phone || record.phone || record.mobile_number || "",
    existingCustomerAddress: record.address || "",
  };
};

const mapPenaltyLookup = (record) => {
  if (!record) return null;

  return {
    customerId: record.customerId || record.customer_id || record.id || null,
    customerName: record.name || record.customerName || record.customer_name || record.existing_name || "",
    consumerNumber: record.consumerNumber || record.consumer_number || "",
  };
};

function Dashboard({ onSignOut }) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [view, setView] = useState("list");
  const [step, setStep] = useState(1);

  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsSearch, setComplaintsSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openComplaintActionId, setOpenComplaintActionId] = useState(null);
  const [complaintActionLoadingId, setComplaintActionLoadingId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);
  const [selectedAssignDriverId, setSelectedAssignDriverId] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [issueType, setIssueType] = useState("LEAKAGE");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [newConnectionForm, setNewConnectionForm] = useState(DEFAULT_NEW_CONNECTION_FORM);
  const [connectionSubmitting, setConnectionSubmitting] = useState(false);
  const [recentConnections, setRecentConnections] = useState([]);
  const [recentConnectionsLoading, setRecentConnectionsLoading] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [productSearchTimeout, setProductSearchTimeout] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [transferProductSuggestions, setTransferProductSuggestions] = useState([]);
  const [transferProductTimeout, setTransferProductTimeout] = useState(null);
  const [idProofUploading, setIdProofUploading] = useState(false);

  const [transferForm, setTransferForm] = useState(DEFAULT_TRANSFER_FORM);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferLookupLoading, setTransferLookupLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [recentTransfersLoading, setRecentTransfersLoading] = useState(false);

  const [nameChangeForm, setNameChangeForm] = useState(DEFAULT_NAME_CHANGE_FORM);
  const [nameChangeSubmitting, setNameChangeSubmitting] = useState(false);
  const [nameChangeLookupLoading, setNameChangeLookupLoading] = useState(false);
  const [recentNameChanges, setRecentNameChanges] = useState([]);
  const [recentNameChangesLoading, setRecentNameChangesLoading] = useState(false);

  const [prPenaltyForm, setPrPenaltyForm] = useState(DEFAULT_PR_PENALTY_FORM);
  const [prPenaltySubmitting, setPrPenaltySubmitting] = useState(false);
  const [prPenaltyLookupLoading, setPrPenaltyLookupLoading] = useState(false);
  const [recentPenalties, setRecentPenalties] = useState([]);
  const [recentPenaltiesLoading, setRecentPenaltiesLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const copyOtpClearTimeoutRef = useRef(null);

  const [iocOtpTab, setIocOtpTab] = useState("PENDING");
  const [iocOtps, setIocOtps] = useState([]);
  const [iocOtpsLoading, setIocOtpsLoading] = useState(false);
  const [iocOtpSummary, setIocOtpSummary] = useState({ todayReceived: 0, todayPending: 0, todaySent: 0, allPending: 0 });
  const [iocOtpDate, setIocOtpDate] = useState("");
  const [iocOtpDriverFilter, setIocOtpDriverFilter] = useState("ALL");
  const [showAddOtpForm, setShowAddOtpForm] = useState(false);
  const [addOtpSaleId, setAddOtpSaleId] = useState("");
  const [addOtpValue, setAddOtpValue] = useState("");
  const [addOtpSubmitting, setAddOtpSubmitting] = useState(false);

  const [customerDirectorySearch, setCustomerDirectorySearch] = useState("");
  const [customerDirectory, setCustomerDirectory] = useState([]);
  const [customerDirectoryLoading, setCustomerDirectoryLoading] = useState(false);
  const [selectedDashboardCustomerId, setSelectedDashboardCustomerId] = useState(null);
  const [customerDashboardDetails, setCustomerDashboardDetails] = useState(null);
  const [customerDashboardLoading, setCustomerDashboardLoading] = useState(false);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardOverview, setDashboardOverview] = useState({
    cards: {
      pendingComplaints: 0,
      leakageComplaints: 0,
      newConnections: 0,
      transferRequests: 0,
      nameChangeRequests: 0,
      pendingManagerVerification: 0,
    },
    recentComplaints: [],
  });

  const [prStockSummary, setPrStockSummary] = useState({ normalPrStock: 0, defectivePrStock: 0 });

  const [reportsTimeframe, setReportsTimeframe] = useState("day");
  const [reportsStartDate, setReportsStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportsEndDate, setReportsEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeReportTab, setActiveReportTab] = useState("sales");
  const [reportsLoading, setReportsLoading] = useState(false);
  const [salesReportData, setSalesReportData] = useState(null);
  const [movementReportData, setMovementReportData] = useState(null);
  const [complaintsReportData, setComplaintsReportData] = useState(null);
  const [otpReportData, setOtpReportData] = useState(null);

  const [customerNameSuggestions, setCustomerNameSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState("");
  const suggestionTimeoutRef = useRef(null);

  const customerDetails = selectedCustomer || {};

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const currentStatus = item.workflow_status || item.status;
      const statusMatched =
        statusFilter === "ALL" || String(currentStatus || "").toUpperCase() === statusFilter;
      const searchText = `${item.customer_name || ""} ${item.consumer_number || ""} ${item.complaint_code || ""} ${item.customer_phone || ""} ${item.description || ""}`.toLowerCase();
      const searchMatched = !complaintsSearch || searchText.includes(complaintsSearch.toLowerCase());
      return statusMatched && searchMatched;
    });
  }, [complaints, complaintsSearch, statusFilter]);

  const connectionFinancials = useMemo(() => {
    const deposit = Number(newConnectionForm.depositAmount) || 0;
    const gst = Number(newConnectionForm.gstAmount) || 0;
    const productsTotal = newConnectionForm.selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);
    return { 
      deposit, 
      gst, 
      productsTotal,
      total: deposit + gst + productsTotal 
    };
  }, [newConnectionForm.depositAmount, newConnectionForm.gstAmount, newConnectionForm.selectedProducts]);

  const iocDriverOptions = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const item of iocOtps) {
      if (item.driver_id && !seen.has(item.driver_id)) {
        seen.add(item.driver_id);
        result.push({ id: item.driver_id, name: item.driver_name || "Unknown" });
      }
    }
    return result;
  }, [iocOtps]);

  useEffect(() => {
    const loadCustomers = async () => {
      if (!customerSearch.trim()) {
        setCustomers([]);
        return;
      }
      setCustomersLoading(true);
      try {
        const data = await fetchCustomers(customerSearch.trim());
        setCustomers(data);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load customers.");
      } finally {
        setCustomersLoading(false);
      }
    };

    if (activeMenu === "Complaints") {
      loadCustomers();
    }
  }, [activeMenu, customerSearch]);

  useEffect(() => {
    const loadComplaints = async () => {
      setComplaintsLoading(true);
      try {
        const data = await fetchComplaints(complaintsSearch.trim());
        setComplaints(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load complaints.");
      } finally {
        setComplaintsLoading(false);
      }
    };

    if (activeMenu === "Complaints") {
      loadComplaints();
    }
  }, [activeMenu, complaintsSearch]);

  useEffect(() => {
    if (activeMenu !== "Complaints") return;

    const loadDrivers = async () => {
      setDriversLoading(true);
      try {
        const data = await fetchComplaintDrivers();
        setDrivers(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load drivers.");
      } finally {
        setDriversLoading(false);
      }
    };

    loadDrivers();
  }, [activeMenu]);

  useEffect(() => {
    const loadRecentConnectionItems = async () => {
      setRecentConnectionsLoading(true);
      try {
        setRecentConnections(await fetchRecentConnections());
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load recent connections.");
      } finally {
        setRecentConnectionsLoading(false);
      }
    };

    const loadRecentTransferItems = async () => {
      setRecentTransfersLoading(true);
      try {
        setRecentTransfers(await fetchRecentTransfers());
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load recent transfers.");
      } finally {
        setRecentTransfersLoading(false);
      }
    };

    const loadRecentNameChangeItems = async () => {
      setRecentNameChangesLoading(true);
      try {
        setRecentNameChanges(await fetchRecentNameChanges());
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load recent name changes.");
      } finally {
        setRecentNameChangesLoading(false);
      }
    };

    const loadRecentPenaltyItems = async () => {
      setRecentPenaltiesLoading(true);
      try {
        setRecentPenalties(await fetchRecentPenalties());
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load recent penalties.");
      } finally {
        setRecentPenaltiesLoading(false);
      }
    };

    loadRecentConnectionItems();
    loadRecentTransferItems();
    loadRecentNameChangeItems();
    loadRecentPenaltyItems();
  }, []);

  useEffect(() => {
    const consumerNumber = transferForm.consumerNumber.trim();
    if (!consumerNumber) return;

    const timer = setTimeout(async () => {
      setTransferLookupLoading(true);
      try {
        const record = await lookupTransferCustomer({ consumerNumber });
        const mapped = mapTransferLookup(record);
        if (mapped) {
          setTransferForm((previous) => ({
            ...previous,
            ...mapped,
          }));
          setErrorMessage("");
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          setErrorMessage(error?.response?.data?.message || "Failed to lookup customer for transfer.");
        }
      } finally {
        setTransferLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [transferForm.consumerNumber]);

  useEffect(() => {
    const consumerNumber = nameChangeForm.consumerNumber.trim();
    if (!consumerNumber) return;

    const timer = setTimeout(async () => {
      setNameChangeLookupLoading(true);
      try {
        const record = await lookupNameChangeCustomer({ consumerNumber });
        const mapped = mapNameChangeLookup(record);
        if (mapped) {
          setNameChangeForm((previous) => ({
            ...previous,
            ...mapped,
          }));
          setErrorMessage("");
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          setErrorMessage(error?.response?.data?.message || "Failed to lookup customer for name change.");
        }
      } finally {
        setNameChangeLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [nameChangeForm.consumerNumber]);

  useEffect(() => {
    const consumerNumber = prPenaltyForm.consumerNumber.trim();
    if (!consumerNumber) return;

    const timer = setTimeout(async () => {
      setPrPenaltyLookupLoading(true);
      try {
        const record = await lookupPenaltyCustomer({ consumerNumber });
        const mapped = mapPenaltyLookup(record);
        if (mapped) {
          setPrPenaltyForm((previous) => ({
            ...previous,
            ...mapped,
          }));
          setErrorMessage("");
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          setErrorMessage(error?.response?.data?.message || "Failed to lookup customer for penalty.");
        }
      } finally {
        setPrPenaltyLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [prPenaltyForm.consumerNumber]);


  useEffect(() => {
    if (activeMenu !== "IOC OTPs") return;

    const load = async () => {
      setIocOtpsLoading(true);
      try {
        const [otps, summary] = await Promise.all([
          fetchIocOtps({
            status: iocOtpTab === "ALL" ? undefined : iocOtpTab,
            date: iocOtpDate || undefined,
            driverId: iocOtpDriverFilter === "ALL" ? undefined : iocOtpDriverFilter,
          }),
          fetchIocOtpSummary(),
        ]);
        setIocOtps(otps);
        setIocOtpSummary(summary);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load IOC OTPs.");
      } finally {
        setIocOtpsLoading(false);
      }
    };

    load();
  }, [activeMenu, iocOtpTab, iocOtpDate, iocOtpDriverFilter]);

  const loadPrStock = async () => {
    try {
      const data = await fetchPrStockSummary();
      setPrStockSummary(data);
    } catch (_e) {}
  };

  useEffect(() => {
    if (activeMenu === "PR Penalty") {
      loadPrStock();
    }
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu !== "Reports") return;

    const loadReports = async () => {
      setReportsLoading(true);
      try {
        const params = {
          timeframe: reportsTimeframe,
          startDate: reportsTimeframe === "custom" ? reportsStartDate : undefined,
          endDate: reportsTimeframe === "custom" ? reportsEndDate : undefined,
        };

        if (activeReportTab === "sales") {
          const data = await fetchSalesReport(params);
          setSalesReportData(data);
        } else if (activeReportTab === "movement") {
          const data = await fetchCustomerMovementReport(params);
          setMovementReportData(data);
        } else if (activeReportTab === "complaints") {
          const data = await fetchComplaintsReport(params);
          setComplaintsReportData(data);
        } else if (activeReportTab === "otp") {
          const data = await fetchOtpVerificationReport(params);
          setOtpReportData(data);
        }
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load report data.");
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
  }, [activeMenu, activeReportTab, reportsTimeframe, reportsStartDate, reportsEndDate]);

  useEffect(() => {
    if (activeMenu !== "Customers") return;

    const timer = setTimeout(async () => {
      setCustomerDirectoryLoading(true);
      try {
        const rows = await fetchCustomerDirectory(customerDirectorySearch.trim());
        setCustomerDirectory(rows);

        if (!selectedDashboardCustomerId && rows.length) {
          setSelectedDashboardCustomerId(Number(rows[0].id));
        }

        if (selectedDashboardCustomerId && !rows.some((item) => Number(item.id) === Number(selectedDashboardCustomerId))) {
          setSelectedDashboardCustomerId(rows.length ? Number(rows[0].id) : null);
        }
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load customers dashboard list.");
      } finally {
        setCustomerDirectoryLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeMenu, customerDirectorySearch, selectedDashboardCustomerId]);

  useEffect(() => {
    if (activeMenu !== "Customers" || !selectedDashboardCustomerId) {
      setCustomerDashboardDetails(null);
      return;
    }

    const load = async () => {
      setCustomerDashboardLoading(true);
      try {
        const data = await fetchCustomerDashboardDetails(selectedDashboardCustomerId);
        setCustomerDashboardDetails(data);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load customer details.");
      } finally {
        setCustomerDashboardLoading(false);
      }
    };

    load();
  }, [activeMenu, selectedDashboardCustomerId]);

  useEffect(() => {
    if (activeMenu !== "Dashboard") return;

    const load = async () => {
      setDashboardLoading(true);
      try {
        const [data, otpSummaryData] = await Promise.all([
          fetchDashboardOverview(),
          fetchIocOtpSummary(),
        ]);
        setDashboardOverview(data);
        setIocOtpSummary(otpSummaryData);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load dashboard overview.");
      } finally {
        setDashboardLoading(false);
      }
    };

    load();
  }, [activeMenu]);

  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  const openNewComplaint = () => {
    setView("new");
    setStep(1);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const goBackToList = async () => {
    setView("list");
    setStep(1);
    setErrorMessage("");
    setOpenComplaintActionId(null);
    await fetchComplaints(complaintsSearch.trim()).then((data) => setComplaints(Array.isArray(data) ? data : []));
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleRegisterComplaint = async () => {
    if (!selectedCustomer?.id) {
      setErrorMessage("Please select a customer.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter the complaint description.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      await createComplaint({
        customerId: selectedCustomer.id,
        issueType,
        description,
      });
      setSuccessMessage("Complaint registered successfully.");
      setSelectedCustomer(null);
      setDescription("");
      setIssueType("LEAKAGE");
      setView("list");
      setStep(1);
      setOpenComplaintActionId(null);
      const updated = await fetchComplaints(complaintsSearch.trim());
      setComplaints(Array.isArray(updated) ? updated : []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to register complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplaintActions = (complaintId) => {
    setOpenComplaintActionId((current) => (current === complaintId ? null : complaintId));
  };

  const refreshComplaintList = async () => {
    const updated = await fetchComplaints(complaintsSearch.trim());
    setComplaints(Array.isArray(updated) ? updated : []);
  };

  const openAssignDriverModal = (complaint) => {
    setAssignModalComplaint(complaint);
    setSelectedAssignDriverId(complaint?.driver_id || "");
    setOpenComplaintActionId(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeAssignDriverModal = () => {
    if (complaintActionLoadingId) return;
    setAssignModalComplaint(null);
    setSelectedAssignDriverId("");
  };

  const handleAssignComplaintToDelivery = async () => {
    if (!assignModalComplaint?.id) return;

    if (!selectedAssignDriverId) {
      setErrorMessage("Please choose a driver.");
      return;
    }

    try {
      setComplaintActionLoadingId(assignModalComplaint.id);
      setErrorMessage("");
      setSuccessMessage("");
      await assignComplaintToDeliveryBoy(assignModalComplaint.id, selectedAssignDriverId);
      setSuccessMessage("Complaint assigned to delivery boy.");
      setAssignModalComplaint(null);
      setSelectedAssignDriverId("");
      await refreshComplaintList();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to assign complaint.");
    } finally {
      setComplaintActionLoadingId(null);
    }
  };

  const handleChangeComplaintStatus = async (complaintId, status, successText) => {
    try {
      setComplaintActionLoadingId(complaintId);
      setErrorMessage("");
      setSuccessMessage("");
      await updateComplaintStatus(complaintId, status);
      setSuccessMessage(successText);
      setOpenComplaintActionId(null);
      await refreshComplaintList();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update complaint status.");
    } finally {
      setComplaintActionLoadingId(null);
    }
  };

  const handleMenuClick = (item) => {
    setActiveMenu(item);
    setErrorMessage("");
    setSuccessMessage("");
    if (item !== "Complaints") {
      setView("list");
      setStep(1);
    }
  };

  const handleConnectionInputChange = (event) => {
    const { name, value } = event.target;
    setNewConnectionForm((previous) => ({ ...previous, [name]: value }));
  };

  const searchCustomerNameSuggestions = (field, query) => {
    setActiveSuggestionField(field);

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    const trimmed = String(query || "").trim();
    if (trimmed.length < 2) {
      setCustomerNameSuggestions([]);
      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        const rows = await fetchCustomers(trimmed);
        setCustomerNameSuggestions(Array.isArray(rows) ? rows : []);
      } catch (_error) {
        setCustomerNameSuggestions([]);
      }
    }, 250);
  };

  const clearCustomerNameSuggestions = () => {
    setActiveSuggestionField("");
    setCustomerNameSuggestions([]);
  };

  const handleSelectSuggestedCustomer = (field, customer) => {
    const name = String(customer?.name || "");
    const phone = String(customer?.phone || "");
    const address = String(customer?.address || "");
    const consumerNumber = String(customer?.consumer_number || "");
    const customerId = customer?.id || null;

    if (field === "new-connection") {
      setNewConnectionForm((previous) => ({
        ...previous,
        customerName: name,
        mobileNumber: phone || previous.mobileNumber,
        address: address || previous.address,
      }));
    }

    if (field === "transfer-existing") {
      setTransferForm((previous) => ({
        ...previous,
        existingName: name,
        consumerNumber: consumerNumber || previous.consumerNumber,
        existingCustomerId: customerId,
      }));
    }

    if (field === "transfer-new") {
      setTransferForm((previous) => ({
        ...previous,
        newCustomerName: name,
        newCustomerMobile: phone || previous.newCustomerMobile,
        newCustomerAddress: address || previous.newCustomerAddress,
      }));
    }

    if (field === "name-change-existing") {
      setNameChangeForm((previous) => ({
        ...previous,
        existingName: name,
        consumerNumber: consumerNumber || previous.consumerNumber,
        existingCustomerId: customerId,
        existingCustomerPhone: phone || previous.existingCustomerPhone,
      }));
    }

    if (field === "pr-penalty") {
      setPrPenaltyForm((previous) => ({
        ...previous,
        customerName: name,
        customerId,
        consumerNumber: consumerNumber || previous.consumerNumber,
      }));
    }

    clearCustomerNameSuggestions();
  };

  const handleConnectionCustomerNameChange = (event) => {
    const value = event.target.value;
    setNewConnectionForm((previous) => ({ ...previous, customerName: value }));
    searchCustomerNameSuggestions("new-connection", value);
  };

  const handleTransferExistingNameChange = (event) => {
    const value = event.target.value;
    setTransferForm((previous) => ({
      ...previous,
      existingName: value,
      existingCustomerId: null,
      existingProductDetails: "",
    }));
    searchCustomerNameSuggestions("transfer-existing", value);
  };

  const handleTransferNewAgencyNameChange = (event) => {
    const value = event.target.value;
    // Free-text agency name — this is NOT an existing customer, so no customer
    // autosuggest here.
    setTransferForm((previous) => ({ ...previous, newCustomerName: value }));
  };

  const handleNameChangeExistingNameChange = (event) => {
    const value = event.target.value;
    setNameChangeForm((previous) => ({
      ...previous,
      existingName: value,
      existingCustomerId: null,
      existingCustomerPhone: "",
    }));
    searchCustomerNameSuggestions("name-change-existing", value);
  };

  const handlePrPenaltyCustomerNameChange = (event) => {
    const value = event.target.value;
    setPrPenaltyForm((previous) => ({
      ...previous,
      customerName: value,
      customerId: null,
    }));
    searchCustomerNameSuggestions("pr-penalty", value);
  };

  const handleTransferInputChange = (event) => {
    const { name, value } = event.target;
    setTransferForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name === "consumerNumber") {
        next.existingCustomerId = null;
        next.existingProductDetails = "";
        if (!value.trim()) {
          next.existingName = "";
        }
      } else if (name === "existingName") {
        next.existingCustomerId = null;
        next.existingProductDetails = "";
      }
      return next;
    });
  };

  const handleNameChangeInputChange = (event) => {
    const { name, value } = event.target;
    setNameChangeForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name === "consumerNumber") {
        next.existingCustomerId = null;
        next.existingCustomerPhone = "";
        if (!value.trim()) {
          next.existingName = "";
        }
      } else if (name === "existingName") {
        next.existingCustomerId = null;
        next.existingCustomerPhone = "";
      }
      return next;
    });
  };

  const handlePrPenaltyInputChange = (event) => {
    const { name, value } = event.target;

    setPrPenaltyForm((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (name === "consumerNumber") {
        next.customerId = null;
        if (!value.trim()) {
          next.customerName = "";
        }
      } else if (name === "customerName") {
        next.customerId = null;
      }

      return next;
    });
  };

  const handleNameChangeDocumentUpload = async (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    try {
      setErrorMessage("");
      const url = await uploadSupportingDocument(file);
      setNameChangeForm((previous) => ({
        ...previous,
        documentUrl: url || "",
        documentLabel: file.name,
      }));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to upload supporting document.");
    }
  };

  const handleProductSearch = (value) => {
    setNewConnectionForm((previous) => ({
      ...previous,
      productDetails: value,
    }));

    if (productSearchTimeout) clearTimeout(productSearchTimeout);

    const timeout = setTimeout(async () => {
      try {
        const rows = await searchConnectionProducts(value.trim());
        setProductSuggestions(rows);
      } catch (_error) {
        setProductSuggestions([]);
      }
    }, 250);
    setProductSearchTimeout(timeout);
  };

  const handleSelectProduct = (product) => {
    const nextProduct = {
      id: Number(product.id),
      name: product.name || "Product",
      type: product.type || "",
      price: Number(product.price || 0),
    };

    setNewConnectionForm((previous) => ({
      ...previous,
      productDetails: "",
      productId: previous.productId || nextProduct.id,
      selectedProducts: previous.selectedProducts.some((item) => Number(item.id) === nextProduct.id)
        ? previous.selectedProducts
        : [...previous.selectedProducts, nextProduct],
    }));
    setProductSuggestions([]);
  };

  const handleRemoveConnectionProduct = (productId) => {
    setNewConnectionForm((previous) => {
      const selectedProducts = previous.selectedProducts.filter((item) => Number(item.id) !== Number(productId));
      return {
        ...previous,
        selectedProducts,
        productId: selectedProducts[0]?.id || null,
      };
    });
  };

  const handleTransferEmptyProductSearch = (value) => {
    setTransferForm((previous) => ({
      ...previous,
      emptyProductName: value,
      emptyProductId: null,
    }));

    if (transferProductTimeout) clearTimeout(transferProductTimeout);

    if (!value.trim()) {
      setTransferProductSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const rows = await searchConnectionProducts(value.trim());
        setTransferProductSuggestions(rows);
      } catch (_error) {
        setTransferProductSuggestions([]);
      }
    }, 250);
    setTransferProductTimeout(timeout);
  };

  const handleSelectTransferEmptyProduct = (product) => {
    setTransferForm((previous) => ({
      ...previous,
      emptyProductId: Number(product.id),
      emptyProductName: product.name || "Product",
    }));
    setTransferProductSuggestions([]);
  };

  const handleIdProofUpload = async (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    try {
      setIdProofUploading(true);
      setErrorMessage("");
      const url = await uploadSupportingDocument(file);
      setNewConnectionForm((previous) => ({
        ...previous,
        idProofUrl: url || "",
        idProofLabel: file.name,
      }));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to upload ID proof.");
    } finally {
      setIdProofUploading(false);
    }
  };

  const handleSendToCashier = async () => {
    if (!newConnectionForm.customerName.trim()) {
      setErrorMessage("Customer name is required.");
      return;
    }
    if (!newConnectionForm.mobileNumber.trim()) {
      setErrorMessage("Mobile number is required.");
      return;
    }
    if (!newConnectionForm.address.trim()) {
      setErrorMessage("Address is required.");
      return;
    }

    try {
      setConnectionSubmitting(true);
      setErrorMessage("");
      await createNewConnection({
        customerName: newConnectionForm.customerName,
        mobileNumber: newConnectionForm.mobileNumber,
        consumerNumber: newConnectionForm.consumerNumber.trim() || undefined,
        address: newConnectionForm.address,
        idProofDetails: newConnectionForm.idProofDetails,
        idProofUrl: newConnectionForm.idProofUrl,
        productDetails: newConnectionForm.selectedProducts
          .map((item) => `${item.name}${item.type ? ` (${item.type})` : ""}`)
          .join(", "),
        productId: newConnectionForm.selectedProducts[0]?.id || newConnectionForm.productId,
        products: newConnectionForm.selectedProducts.map((item) => ({
          productId: item.id,
        })),
        depositAmount: connectionFinancials.deposit,
        gstAmount: connectionFinancials.gst,
        productsTotal: connectionFinancials.productsTotal,
        totalAmount: connectionFinancials.total,
      });
      setSuccessMessage("New connection sent to cashier & customer registered successfully.");
      setNewConnectionForm(DEFAULT_NEW_CONNECTION_FORM);
      setProductSuggestions([]);
      setRecentConnections(await fetchRecentConnections());
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to send new connection.");
    } finally {
      setConnectionSubmitting(false);
    }
  };

  const triggerTransferLookup = async () => {
    const num = transferForm.consumerNumber.trim();
    if (!num) {
      setErrorMessage("Please enter a Consumer Number to search.");
      return;
    }
    setTransferLookupLoading(true);
    setErrorMessage("");
    try {
      const record = await lookupTransferCustomer({ consumerNumber: num });
      const mapped = mapTransferLookup(record);
      if (mapped && mapped.existingCustomerId) {
        setTransferForm((prev) => ({ ...prev, ...mapped }));
        setSuccessMessage(`Found customer: ${mapped.existingName}`);
      } else {
        setErrorMessage(`No customer found with Consumer Number: ${num}`);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Customer not found for transfer.");
    } finally {
      setTransferLookupLoading(false);
    }
  };

  const triggerNameChangeLookup = async () => {
    const num = nameChangeForm.consumerNumber.trim();
    if (!num) {
      setErrorMessage("Please enter a Consumer Number to search.");
      return;
    }
    setNameChangeLookupLoading(true);
    setErrorMessage("");
    try {
      const record = await lookupNameChangeCustomer({ consumerNumber: num });
      const mapped = mapNameChangeLookup(record);
      if (mapped && mapped.existingCustomerId) {
        setNameChangeForm((prev) => ({ ...prev, ...mapped }));
        setSuccessMessage(`Found customer: ${mapped.existingName}`);
      } else {
        setErrorMessage(`No customer found with Consumer Number: ${num}`);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Customer not found for name change.");
    } finally {
      setNameChangeLookupLoading(false);
    }
  };

  const triggerPenaltyLookup = async () => {
    const num = prPenaltyForm.consumerNumber.trim();
    if (!num) {
      setErrorMessage("Please enter a Consumer Number to search.");
      return;
    }
    setPrPenaltyLookupLoading(true);
    setErrorMessage("");
    try {
      const record = await lookupPenaltyCustomer({ consumerNumber: num });
      const mapped = mapPenaltyLookup(record);
      if (mapped && mapped.customerId) {
        setPrPenaltyForm((prev) => ({ ...prev, ...mapped }));
        setSuccessMessage(`Found customer: ${mapped.customerName}`);
      } else {
        setErrorMessage(`No customer found with Consumer Number: ${num}`);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Customer not found.");
    } finally {
      setPrPenaltyLookupLoading(false);
    }
  };

  const handleSendTransferRequest = async () => {
    if (!transferForm.existingCustomerId) {
      setErrorMessage("Please lookup and select an existing customer first.");
      return;
    }
    if (!transferForm.newCustomerName.trim()) {
      setErrorMessage("New agency name is required.");
      return;
    }
    if (!transferForm.reason.trim()) {
      setErrorMessage("Reason for transfer is required.");
      return;
    }

    try {
      setTransferSubmitting(true);
      setErrorMessage("");
      await createCustomerTransfer({
        existingCustomerId: transferForm.existingCustomerId,
        newAgencyName: transferForm.newCustomerName,
        newAgencyPhone: transferForm.newCustomerMobile,
        newAgencyAddress: transferForm.newCustomerAddress,
        depositLiability: Number(transferForm.depositLiability) || 0,
        reason: transferForm.reason,
        isRegulatorReceived: transferForm.isRegulatorReceived ? 1 : 0,
        emptyProductId: transferForm.emptyProductId || null,
        emptyCylinderQty: Number(transferForm.emptyCylinderQty) || 0,
      });
      setSuccessMessage("Transfer request sent successfully.");
      setTransferForm(DEFAULT_TRANSFER_FORM);
      setRecentTransfers(await fetchRecentTransfers());
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to create transfer request.");
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleCreateNameChangeRequest = async () => {
    if (!nameChangeForm.existingCustomerId) {
      setErrorMessage("Please lookup and select an existing customer first.");
      return;
    }
    if (!nameChangeForm.newName.trim()) {
      setErrorMessage("New name is required.");
      return;
    }
    if (!nameChangeForm.isSameAddress && !nameChangeForm.newAddress.trim()) {
      setErrorMessage("Please enter the new address or check Same Address.");
      return;
    }
    if (!nameChangeForm.documentUrl) {
      setErrorMessage("Please upload the supporting document.");
      return;
    }

    try {
      setNameChangeSubmitting(true);
      setErrorMessage("");
      await createNameChangeRequest({
        customerId: nameChangeForm.existingCustomerId,
        newName: nameChangeForm.newName,
        serviceFee: Number(nameChangeForm.serviceFee) || 0,
        documentUrl: nameChangeForm.documentUrl,
        isSameAddress: nameChangeForm.isSameAddress,
        address: nameChangeForm.isSameAddress ? undefined : nameChangeForm.newAddress.trim(),
      });
      setSuccessMessage("Name change request created successfully.");
      setNameChangeForm(DEFAULT_NAME_CHANGE_FORM);
      setRecentNameChanges(await fetchRecentNameChanges());
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to create name change request.");
    } finally {
      setNameChangeSubmitting(false);
    }
  };

  const handleRecordPenalty = async () => {
    if (!prPenaltyForm.customerId) {
      setErrorMessage("Please enter valid consumer number or select customer.");
      return;
    }

    if (!prPenaltyForm.penaltyReason.trim()) {
      setErrorMessage("Reason is required.");
      return;
    }

    const amount = Number(prPenaltyForm.penaltyAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setErrorMessage("Amount must be 0 or greater.");
      return;
    }

    try {
      setPrPenaltySubmitting(true);
      setErrorMessage("");

      await createPenalty({
        customerId: prPenaltyForm.customerId,
        penaltyReason: prPenaltyForm.penaltyReason,
        penaltyAmount: amount,
        transactionType: prPenaltyForm.transactionType,
        quantity: Number(prPenaltyForm.quantity) || 1,
      });

      setSuccessMessage(
        prPenaltyForm.transactionType === "REPLACEMENT"
          ? "PR replacement recorded successfully (Normal PR -1, Defective PR +1)."
          : "PR penalty recorded successfully (Normal PR -1)."
      );
      setPrPenaltyForm(DEFAULT_PR_PENALTY_FORM);
      setRecentPenalties(await fetchRecentPenalties());
      await loadPrStock();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to record penalty/replacement.");
    } finally {
      setPrPenaltySubmitting(false);
    }
  };

  const handleMarkPenaltyPaid = async (penaltyId) => {
    try {
      setErrorMessage("");
      await markPenaltyPaid(penaltyId);
      setSuccessMessage("Penalty marked as paid.");
      setRecentPenalties(await fetchRecentPenalties());
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to mark penalty as paid.");
    }
  };


  const handleIocOtpTabChange = (nextTab) => {
    setIocOtpTab(nextTab);
  };

  const handleMarkOtpSent = async (otpId) => {
    try {
      setErrorMessage("");
      await markOtpSent(otpId);
      setSuccessMessage("OTP marked as sent.");

      const [otps, summary] = await Promise.all([
        fetchIocOtps({
          status: iocOtpTab === "ALL" ? undefined : iocOtpTab,
          date: iocOtpDate || undefined,
          driverId: iocOtpDriverFilter === "ALL" ? undefined : iocOtpDriverFilter,
        }),
        fetchIocOtpSummary(),
      ]);

      setIocOtps(otps);
      setIocOtpSummary(summary);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to mark OTP as sent.");
    }
  };

  const handleCopyOtp = (otpValue) => {
    if (copyOtpClearTimeoutRef.current) {
      clearTimeout(copyOtpClearTimeoutRef.current);
    }

    navigator.clipboard.writeText(String(otpValue || "")).then(
      () => {
        setSuccessMessage("OTP copied to clipboard.");
        copyOtpClearTimeoutRef.current = setTimeout(() => {
          setSuccessMessage((currentMessage) =>
            currentMessage === "OTP copied to clipboard." ? "" : currentMessage
          );
        }, 3000);
      },
      () => setErrorMessage("Failed to copy OTP.")
    );
  };

  useEffect(() => {
    return () => {
      if (copyOtpClearTimeoutRef.current) {
        clearTimeout(copyOtpClearTimeoutRef.current);
      }
    };
  }, []);

  const handleAddIocOtp = async () => {
    if (!addOtpSaleId.trim()) {
      setErrorMessage("Sale ID is required.");
      return;
    }

    if (!addOtpValue.trim()) {
      setErrorMessage("OTP is required.");
      return;
    }

    try {
      setAddOtpSubmitting(true);
      setErrorMessage("");
      await addIocOtpManual({ saleId: Number(addOtpSaleId), otp: addOtpValue.trim() });
      setSuccessMessage("OTP added successfully.");
      setShowAddOtpForm(false);
      setAddOtpSaleId("");
      setAddOtpValue("");

      const [otps, summary] = await Promise.all([
        fetchIocOtps({
          status: iocOtpTab === "ALL" ? undefined : iocOtpTab,
          date: iocOtpDate || undefined,
          driverId: iocOtpDriverFilter === "ALL" ? undefined : iocOtpDriverFilter,
        }),
        fetchIocOtpSummary(),
      ]);

      setIocOtps(otps);
      setIocOtpSummary(summary);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to add OTP.");
    } finally {
      setAddOtpSubmitting(false);
    }
  };

  const handleDownloadIocOtpsSheet = () => {
    if (!iocOtps.length) {
      setErrorMessage("No OTP data to download.");
      return;
    }

    // Prepare CSV header
    const headers = ["Date", "Driver", "Customer", "Consumer number", "Item Name", "Quantity", "Settlement", "OTP", "Status", "Sent At"];
    
    // Prepare CSV rows
    const rows = iocOtps.map((item) => [
      item.created_at_formatted || "",
      item.driver_name || "-",
      item.customer_name || "-",
      item.consumer_number || "-",
      item.item_name || "14.2 KG Domestic",
      item.quantity || 1,
      item.settlement || "Direct",
      item.otp || "",
      (String(item.status || "PENDING").toUpperCase() === "PENDING" ? "Pending" : "Sent"),
      item.created_at || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `IOC_OTPs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage("IOC OTPs data downloaded successfully.");
  };

  const handleDownloadReportCsv = () => {
    let headers = [];
    let rows = [];
    const filename = `Report_${activeReportTab}_${new Date().toISOString().split("T")[0]}.csv`;

    if (activeReportTab === "sales") {
      const items = salesReportData?.salesList || [];
      if (!items.length) {
        setErrorMessage("No sales data to export.");
        return;
      }
      headers = ["Sale ID", "Date", "Customer Name", "Consumer #", "Driver", "Items", "Total Qty", "Amount (₹)", "Payment Method", "Settlement", "Status"];
      rows = items.map((r) => [
        r.id,
        r.date_formatted || "",
        r.customer_name || "-",
        r.consumer_number || "-",
        r.driver_name || "-",
        r.items || "14.2 KG Domestic",
        r.total_qty || 1,
        Number(r.total_amount || 0).toFixed(2),
        r.payment_method || "-",
        r.settlement || "Direct",
        r.status || "-",
      ]);
    } else if (activeReportTab === "movement") {
      const connItems = (movementReportData?.newConnections || []).map((c) => [
        c.date_formatted || "",
        "New Connection",
        c.customer_name || "-",
        c.consumer_number || "-",
        `₹ ${c.total_amount || 0} - ${c.product_details || "Standard"}`,
        c.payment_status || "COMPLETED",
      ]);
      const trItems = (movementReportData?.transfers || []).map((t) => [
        t.date_formatted || "",
        "Transfer Out",
        t.old_customer_name || "-",
        t.consumer_number || "-",
        `To: ${t.new_agency_name || "New Agency"} (${t.reason || "-"})`,
        t.status || "-",
      ]);
      const ncItems = (movementReportData?.nameChanges || []).map((n) => [
        n.date_formatted || "",
        "Name Change",
        `${n.old_name_snapshot} -> ${n.new_name_requested}`,
        n.consumer_number || "-",
        `Fee: ₹ ${n.service_fee || 0}`,
        n.status || "-",
      ]);
      rows = [...connItems, ...trItems, ...ncItems];
      if (!rows.length) {
        setErrorMessage("No customer movement data to export.");
        return;
      }
      headers = ["Date", "Movement Type", "Customer Name / Details", "Consumer #", "Details / Remarks", "Status"];
    } else if (activeReportTab === "complaints") {
      const items = complaintsReportData?.complaintsList || [];
      if (!items.length) {
        setErrorMessage("No complaints data to export.");
        return;
      }
      headers = ["Complaint #", "Date", "Customer Name", "Consumer #", "Category", "Description", "Priority", "Assigned Driver", "Status"];
      rows = items.map((r) => [
        r.complaint_number || r.id,
        r.date_formatted || "",
        r.customer_name || "-",
        r.consumer_number || "-",
        r.category || "-",
        r.description || "-",
        r.priority || "-",
        r.assigned_driver || "-",
        r.status || "-",
      ]);
    } else if (activeReportTab === "otp") {
      const items = otpReportData?.otpsList || [];
      if (!items.length) {
        setErrorMessage("No OTP data to export.");
        return;
      }
      headers = ["Date", "Driver", "Customer", "Consumer #", "Item", "Quantity", "Settlement", "OTP", "Status"];
      rows = items.map((r) => [
        r.date_formatted || "",
        r.driver_name || "-",
        r.customer_name || "-",
        r.consumer_number || "-",
        r.item_name || "14.2 KG Domestic",
        r.quantity || 1,
        r.settlement || "Direct",
        r.otp || "-",
        r.status || "-",
      ]);
    }

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage("Report exported successfully.");
  };

  const handleClearCustomerSelection = () => {
    setSelectedDashboardCustomerId(null);
    setCustomerDashboardDetails(null);
  };


  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-head">
          <div className="brand-icon">L</div>
          <div>
            <p className="brand-title">LPG Support</p>
            <p className="brand-subtitle">Agency ERP</p>
          </div>
        </div>

        <p className="menu-label">Menu</p>

        <nav className="side-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-link ${activeMenu === item ? "active" : ""}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="nav-icon">{SIDEBAR_ICONS[item]}</span>
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-link logout-link" onClick={onSignOut}>
            <span className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="page-head">
          <div>
            <h2>
              {activeMenu === "Complaints"
                ? view === "new"
                  ? "New Complaint"
                  : "Complaints"
                : activeMenu}
            </h2>
            <p className="subtitle">
              {activeMenu === "Complaints"
                ? view === "new"
                  ? "Register a new customer complaint in 3 quick steps"
                  : "Log, assign and track customer complaints"
                : activeMenu === "Dashboard"
                  ? "Live overview of customer support operations"
                : activeMenu === "New Connection"
                  ? "Onboard new LPG customers"
                  : activeMenu === "Transfer"
                    ? "Transfer LPG connection to a new customer"
                    : activeMenu === "Name Change"
                      ? "Update customer name on connection"
                      : activeMenu === "PR Penalty"
                        ? "Record and track penalty fees"
                      : activeMenu === "IOC OTPs"
                        ? "OTPs received from drivers - copy  and send to IOC"
                      : activeMenu === "Customers"
                        ? "Search and view customer history"
                      : "This section will be available soon"}
            </p>
          </div>

          {activeMenu === "Complaints" && view === "new" ? (
            <button type="button" className="secondary-btn" onClick={goBackToList}>
              Back to Complaints
            </button>
          ) : null}

          {activeMenu === "Complaints" && view === "list" ? (
            <button type="button" className="primary-btn" onClick={openNewComplaint}>
              + New Complaint
            </button>
          ) : null}

          {activeMenu === "IOC OTPs" ? (
            <button type="button" className="primary-btn" onClick={() => setShowAddOtpForm((prev) => !prev)}>
              + Add OTP
            </button>
          ) : null}
        </header>

        {errorMessage ? <p className="msg error">{errorMessage}</p> : null}
        {successMessage ? <p className="msg success">{successMessage}</p> : null}

        {activeMenu === "Dashboard" ? (
          <section className="support-dashboard-section">
            <div className="support-dashboard-cards">
              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">Pending Complaints</p>
                  <strong>{dashboardOverview.cards.pendingComplaints}</strong>
                </div>
                <span className="support-kpi-icon warning">{DASHBOARD_CARD_ICONS.pendingComplaints}</span>
              </article>

              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">Leakage Complaints</p>
                  <strong>{dashboardOverview.cards.leakageComplaints}</strong>
                </div>
                <span className="support-kpi-icon danger">{DASHBOARD_CARD_ICONS.leakageComplaints}</span>
              </article>

              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">New Connections</p>
                  <strong>{dashboardOverview.cards.newConnections}</strong>
                </div>
                <span className="support-kpi-icon sky">{DASHBOARD_CARD_ICONS.newConnections}</span>
              </article>

              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">Transfer Requests</p>
                  <strong>{dashboardOverview.cards.transferRequests}</strong>
                </div>
                <span className="support-kpi-icon sky">{DASHBOARD_CARD_ICONS.transferRequests}</span>
              </article>

              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">IOC- OTPs</p>
                  <strong>{iocOtpSummary.todayReceived}</strong>
                </div>
                <span className="support-kpi-icon sky">{DASHBOARD_CARD_ICONS.nameChangeRequests}</span>
              </article>

              <article className="support-kpi-card">
                <div>
                  <p className="support-kpi-label">Pending Manager Verification</p>
                  <strong>{dashboardOverview.cards.pendingManagerVerification}</strong>
                </div>
                <span className="support-kpi-icon warning">{DASHBOARD_CARD_ICONS.pendingManagerVerification}</span>
              </article>
            </div>

            <article className="support-recent-card">
              <div className="support-recent-head">
                <div>
                  <h3>Recent Complaints</h3>
                  <p>Latest tickets logged by customers</p>
                </div>
                <button type="button" className="support-view-all" onClick={() => handleMenuClick("Complaints")}>
                  View all
                </button>
              </div>

              {dashboardLoading ? <p className="muted">Loading dashboard overview...</p> : null}

              <div className="support-recent-list">
                {!dashboardLoading && !dashboardOverview.recentComplaints?.length ? (
                  <p className="muted">No complaints available.</p>
                ) : null}

                {dashboardOverview.recentComplaints?.map((item) => (
                  <article key={item.id} className="support-recent-item">
                    <div className="support-recent-main">
                      <p className="support-recent-name">
                        {item.customerName}
                        <span>- {item.consumerNumber}</span>
                      </p>
                      <p className="support-recent-desc">{item.description || "No description provided."}</p>
                    </div>

                    <div className="support-recent-tags">
                      <div className="support-recent-chip-row">
                        <span className={`support-chip issue ${String(item.issueType || "Other").toLowerCase()}`}>
                          {item.issueType}
                        </span>
                        <span className={`support-chip status ${getDashboardStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="support-recent-time">{getDaysAgo(item.createdAt)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {activeMenu === "Complaints" && view === "list" ? (
          <section className="panel">
            <div className="filters-row">
              <input
                value={complaintsSearch}
                onChange={(event) => setComplaintsSearch(event.target.value)}
                placeholder="Search by name, consumer no, mobile..."
              />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED_TO_DELIVERY_BOY">Assigned To Delivery Boy</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {complaintsLoading ? <p className="muted">Loading complaints...</p> : null}

            <div className="complaints-list">
              {filteredComplaints.map((item) => (
                <article className="complaint-row" key={item.id}>
                  <div className="row-main">
                    <p className="name-line">
                      <strong>{item.customer_name}</strong>
                      <span className="meta-inline">{item.consumer_number || item.complaint_code || "-"}</span>
                      <span className="meta-inline">{item.customer_phone || "-"}</span>
                    </p>
                    <p className="address-line">{item.address || "Address unavailable"}</p>
                    <p className="description-line">{item.description}</p>
                    {item.assigned_to_name || item.assigned_to ? (
                      <p className="assigned-line">Assigned to: {item.assigned_to_name || item.assigned_to}</p>
                    ) : null}
                    <p className="time-line">{getDaysAgo(item.created_at)}</p>
                  </div>

                  <div className="row-tags">
                    {/** Show workflow status (e.g. ASSIGNED_TO_DELIVERY_BOY) when available. */}
                    {(() => {
                      const currentStatus = item.workflow_status || item.status;
                      return (
                        <div className="chip-row">
                          <span className={`chip chip-issue ${String(item.issue_type).toLowerCase()}`}>
                            {normalizeIssueLabel(item.issue_type)}
                          </span>
                          <span
                            className={`chip chip-status ${normalizeStatus(currentStatus)
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {normalizeStatus(currentStatus)}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="actions-wrap">
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleToggleComplaintActions(item.id)}
                        disabled={complaintActionLoadingId === item.id}
                      >
                        Actions
                      </button>

                      {openComplaintActionId === item.id ? (
                        <div className="actions-menu">
                          <button
                            type="button"
                            onClick={() => openAssignDriverModal(item)}
                            disabled={complaintActionLoadingId === item.id}
                          >
                            Assign To Delivery Boy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeComplaintStatus(item.id, "IN_PROGRESS", "Complaint marked in progress.")}
                            disabled={complaintActionLoadingId === item.id}
                          >
                            Mark In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeComplaintStatus(item.id, "RESOLVED", "Complaint marked completed.")}
                            disabled={complaintActionLoadingId === item.id}
                          >
                            Mark Completed
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}

              {!filteredComplaints.length && !complaintsLoading ? (
                <p className="muted">No complaints found for this filter.</p>
              ) : null}
            </div>

            {assignModalComplaint ? (
              <div className="modal-backdrop" role="presentation" onMouseDown={closeAssignDriverModal}>
                <section
                  className="assign-driver-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="assign-driver-title"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="modal-title-row">
                    <div>
                      <p className="modal-eyebrow">Assign complaint</p>
                      <h2 id="assign-driver-title">Choose delivery driver</h2>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={closeAssignDriverModal}>
                      X
                    </button>
                  </div>

                  <div className="assign-complaint-summary">
                    <strong>{assignModalComplaint.customer_name}</strong>
                    <span>{assignModalComplaint.consumer_number || assignModalComplaint.complaint_code}</span>
                    <p>{assignModalComplaint.description}</p>
                  </div>

                  {driversLoading ? <p className="muted">Loading drivers...</p> : null}

                  <div className="driver-choice-list">
                    {!driversLoading && !drivers.length ? (
                      <p className="muted">No drivers found.</p>
                    ) : null}

                    {drivers.map((driver) => (
                      <button
                        type="button"
                        key={driver.id}
                        className={`driver-choice ${Number(selectedAssignDriverId) === Number(driver.id) ? "selected" : ""}`}
                        onClick={() => setSelectedAssignDriverId(driver.id)}
                      >
                        <span>
                          <strong>{driver.name || "Driver"}</strong>
                          <small>{driver.vehicle || "Vehicle N/A"}</small>
                        </span>
                        <span className="driver-choice-radio" aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={closeAssignDriverModal}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleAssignComplaintToDelivery}
                      disabled={!selectedAssignDriverId || complaintActionLoadingId === assignModalComplaint.id}
                    >
                      {complaintActionLoadingId === assignModalComplaint.id ? "Assigning..." : "Assign Driver"}
                    </button>
                  </div>
                </section>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeMenu === "Complaints" && view !== "list" ? (
          <section className="new-complaint-flow">
            <div className="stepper-bar">
              <button type="button" className={`step-pill ${step >= 1 ? "done" : ""} ${step === 1 ? "active" : ""}`}>
                Customer
              </button>
              <span className="step-line" />
              <button type="button" className={`step-pill ${step >= 2 ? "done" : ""} ${step === 2 ? "active" : ""}`}>
                Issue Details
              </button>
              <span className="step-line" />
              <button type="button" className={`step-pill ${step === 3 ? "active" : ""} ${step > 3 ? "done" : ""}`}>
                Review
              </button>
            </div>

            {step === 1 ? (
              <div className="wizard-card">
                <h3>Find existing customer</h3>
                <p className="wizard-subtitle">Search by name, consumer number or mobile.</p>
                <input
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search customers..."
                />

                {customersLoading ? <p className="muted">Loading customers...</p> : null}

                <div className="customer-search-results">
                  {customerSearch.trim() ? customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className={`customer-result ${selectedCustomer?.id === customer.id ? "active" : ""}`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div>
                        <p className="result-name">
                          {customer.name} <span>{customer.consumer_number}</span>
                        </p>
                        <p className="result-meta">
                          {customer.phone || "-"} {customer.address ? `• ${customer.address}` : ""}
                        </p>
                      </div>
                      <span className="result-icon">+</span>
                    </button>
                  )) : null}
                </div>

                <div className="details-grid">
                  <div>
                    <label>Consumer Number</label>
                    <input value={toText(customerDetails.consumer_number)} readOnly />
                  </div>
                  <div>
                    <label>Customer Name *</label>
                    <input value={toText(customerDetails.name)} readOnly />
                  </div>
                  <div>
                    <label>Mobile Number *</label>
                    <input value={toText(customerDetails.phone)} readOnly />
                  </div>
                  <div>
                    <label>Address</label>
                    <input value={toText(customerDetails.address)} readOnly />
                  </div>
                </div>

                <div className="flow-actions spread">
                  <button type="button" className="secondary-btn" onClick={goBackToList}>
                    Back
                  </button>
                  <button type="button" className="primary-btn" disabled={!selectedCustomer} onClick={() => setStep(2)}>
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="wizard-card">
                <h3>Describe the issue</h3>
                <p className="wizard-subtitle">Choose a category and capture all relevant details.</p>

                <label>Issue Type</label>
                <div className="issue-tabs-row">
                  {ISSUE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`issue-tab ${issueType === option.value ? "active" : ""}`}
                      onClick={() => setIssueType(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {issueType === "LEAKAGE" ? (
                  <div className="priority-banner">
                    <strong>High priority - Leakage</strong>
                    <span>
                      Advise the customer to close the regulator and ventilate the area immediately.
                    </span>
                  </div>
                ) : null}

                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Explain the issue in the customer's words..."
                />

                <div className="flow-actions spread">
                  <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className="primary-btn" disabled={!description.trim()} onClick={() => setStep(3)}>
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="wizard-card">
                <h3>Review & confirm</h3>
                <p className="wizard-subtitle">Verify the details before registering this complaint.</p>

                <div className="review-grid">
                  <div>
                    <label>Customer</label>
                    <p>{toText(customerDetails.name) || "-"}</p>
                    <label>Mobile</label>
                    <p>{toText(customerDetails.phone) || "-"}</p>
                  </div>
                  <div>
                    <label>Consumer Number</label>
                    <p>{toText(customerDetails.consumer_number) || "-"}</p>
                    <label>Address</label>
                    <p>{toText(customerDetails.address) || "-"}</p>
                  </div>
                </div>

                <div className="review-tags">
                  <span className={`chip chip-issue ${String(issueType).toLowerCase()}`}>
                    {normalizeIssueLabel(issueType)}
                  </span>
                  <span className="chip chip-status pending">Pending</span>
                </div>

                <label>Description</label>
                <div className="review-description">{description}</div>

                <div className="flow-actions spread">
                  <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button type="button" className="primary-btn" disabled={submitting} onClick={handleRegisterComplaint}>
                    {submitting ? "Registering..." : "Register Complaint"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeMenu === "New Connection" ? (
          <section className="new-connection-grid">
            <article className="new-connection-form-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>Add New Customer / Connection Applicant</h3>
                <span className="payment-chip pending" style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>New Applicant Mode</span>
              </div>

              <div className="new-connection-fields two-column">
                <div>
                  <label>Applicant Full Name *</label>
                  <input
                    name="customerName"
                    value={newConnectionForm.customerName}
                    onChange={handleConnectionInputChange}
                    placeholder="Enter applicant full name"
                  />
                </div>
                <div>
                  <label>Mobile Number *</label>
                  <input
                    name="mobileNumber"
                    value={newConnectionForm.mobileNumber}
                    onChange={handleConnectionInputChange}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="new-connection-fields two-column">
                <div>
                  <label>Consumer Number / ID </label>
                  <input
                    name="consumerNumber"
                    value={newConnectionForm.consumerNumber}
                    onChange={handleConnectionInputChange}
                    placeholder="e.g. 7000000000123456 (or leave empty to auto-generate)"
                  />
                  <p className="field-hint">If applicant already has an assigned Consumer ID, enter it here. Otherwise, an ID will be generated upon submission.</p>
                </div>
                <div>
                  <label>Applicant Address *</label>
                  <input
                    name="address"
                    value={newConnectionForm.address}
                    onChange={handleConnectionInputChange}
                    placeholder="Full residential or commercial address"
                  />
                </div>
              </div>

              <div className="new-connection-fields">
                <label>ID Proof *</label>
                <label className="upload-field">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleIdProofUpload}
                    disabled={idProofUploading}
                  />
                  <span>
                    {idProofUploading
                      ? "Uploading..."
                      : newConnectionForm.idProofLabel
                      ? `✓ ${newConnectionForm.idProofLabel}`
                      : "Upload Aadhaar / PAN / Passport / Voter ID"}
                  </span>
                </label>
                {newConnectionForm.idProofUrl ? <p className="upload-success">ID proof uploaded successfully.</p> : null}
              </div>

                <div className="new-connection-fields">
                <label>Product</label>
                <div>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={async () => {
                      setShowProductModal(true);
                      if (!productSuggestions.length) {
                        try {
                          const rows = await searchConnectionProducts("");
                          setProductSuggestions(rows);
                        } catch (_error) {
                          setProductSuggestions([]);
                        }
                      }
                    }}
                  >
                    + Select Product
                  </button>
                </div>
                {newConnectionForm.selectedProducts.length ? (
                  <div className="selected-product-chips">
                    {newConnectionForm.selectedProducts.map((product) => (
                      <span key={product.id} className="selected-product-chip">
                        {product.name}{product.type ? ` (${product.type})` : ""} · ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        <button
                          type="button"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => handleRemoveConnectionProduct(product.id)}
                        >
                          X
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="new-connection-fields two-column">
                <div>
                  <label>Deposit Amount (₹)</label>
                  <input name="depositAmount" type="number" min="0" step="0.01" value={newConnectionForm.depositAmount} onChange={handleConnectionInputChange} />
                </div>
                <div>
                  <label>GST Amount (₹)</label>
                  <input name="gstAmount" type="number" min="0" step="0.01" value={newConnectionForm.gstAmount} onChange={handleConnectionInputChange} />
                </div>
              </div>

              <div className="amount-row">
                <label>Final Amount</label>
                <div className="total-payable-box" style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Deposit & GST</span>
                    <span>₹ {(connectionFinancials.deposit + connectionFinancials.gst).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
                    <span>Products Total</span>
                    <span>₹ {connectionFinancials.productsTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span>Total payable</span>
                    <strong>₹ {connectionFinancials.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="new-connection-actions">
                <button type="button" className="primary-btn" disabled={connectionSubmitting} onClick={handleSendToCashier}>
                  {connectionSubmitting ? "Sending..." : "Send to Cashier"}
                </button>
              </div>
            </article>

            {showProductModal ? (
              <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowProductModal(false)}>
                <section
                  className="assign-driver-modal"
                  role="dialog"
                  aria-modal="true"
                  style={{ maxWidth: "600px", width: "100%" }}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="modal-title-row">
                    <div>
                      <h2 id="product-modal-title">Select Product</h2>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={() => setShowProductModal(false)}>
                      X
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search product by name or type..."
                    value={newConnectionForm.productDetails || ""}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px" }}
                  />

                  <div className="product-table-wrapper" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table className="product-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                      <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                        <tr>
                          <th style={{ padding: "10px", borderBottom: "2px solid #eee" }}>Name</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #eee" }}>Type</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #eee" }}>Price (₹)</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #eee" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSuggestions.map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px" }}>{item.name}</td>
                            <td style={{ padding: "10px" }}>{item.type}</td>
                            <td style={{ padding: "10px" }}>{Number(item.price || 0).toFixed(2)}</td>
                            <td style={{ padding: "10px" }}>
                              <button
                                type="button"
                                className="secondary-btn"
                                style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                                onClick={() => {
                                  handleSelectProduct(item);
                                  setShowProductModal(false);
                                }}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!productSuggestions.length && (
                          <tr>
                            <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : null}

            <aside className="recent-applications-card">
              <h4>Recent Applications</h4>
              {recentConnectionsLoading ? <p className="muted">Loading recent connections...</p> : null}
              {!recentConnectionsLoading && !recentConnections.length ? <p className="muted">No recent connections yet.</p> : null}
              <div className="recent-applications-list">
                {recentConnections.map((item) => {
                  const isConnectionPaid =
                    String(item.payment_status || "").toUpperCase() === "PAID";
                  return (
                  <article key={item.id} className="recent-application-row">
                    <div className="recent-row-head">
                      <p>{item.customer_name || item.name || "Customer"}</p>
                      <span className={`payment-chip ${isConnectionPaid ? "approved" : "unpaid"}`}>
                        {isConnectionPaid ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="recent-row-meta recent-row-meta-inline">
                      <span>{item.customer_phone || item.mobile_number || item.phone || "-"}</span>
                      <span>{item.product_details || item.product_name || "Product unavailable"}</span>
                    </p>
                    <p className="recent-row-amount">
                      ₹ {Number(item.total_amount ?? item.total ?? item.deposit_amount ?? 0).toFixed(2)}
                    </p>
                  </article>
                  );
                })}
              </div>
            </aside>
          </section>
        ) : null}

        {activeMenu === "Transfer" ? (
          <section className="transfer-grid">
            <article className="transfer-form-card">
              <h3>Existing Customer Details</h3>

              <div className="transfer-fields">
                <label>Consumer Number *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    name="consumerNumber"
                    value={transferForm.consumerNumber}
                    onChange={handleTransferInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerTransferLookup(); } }}
                    placeholder="Enter Consumer Number (e.g. 7000000000965566 or LPG-00012)"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={triggerTransferLookup}
                    disabled={transferLookupLoading || !transferForm.consumerNumber.trim()}
                  >
                    {transferLookupLoading ? "Searching..." : "🔍 Search"}
                  </button>
                </div>
              </div>

              {transferLookupLoading ? <p className="muted">Looking up customer records...</p> : null}

              {transferForm.existingCustomerId ? (
                <div className="loaded-customer-card" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, color: "#166534" }}>✓ Existing Customer Verified</h4>
                    <span className="payment-chip paid">Ready for Transfer</span>
                  </div>
                  <div className="customer-profile-grid" style={{ marginTop: "0.75rem" }}>
                    <div>
                      <label>Customer Name</label>
                      <p><strong>{transferForm.existingName}</strong></p>
                    </div>
                    <div>
                      <label>Consumer Number</label>
                      <p>{transferForm.consumerNumber}</p>
                    </div>
                    <div>
                      <label>Mobile Number</label>
                      <p>{transferForm.existingCustomerPhone || "-"}</p>
                    </div>
                    <div>
                      <label>Registered Address</label>
                      <p>{transferForm.existingCustomerAddress || "Address on record"}</p>
                    </div>
                    <div>
                      <label>Active Cylinder / Products</label>
                      <p>{transferForm.existingProductDetails || "14.2 KG Domestic"}</p>
                    </div>
                    <div>
                      <label>Deposit Liability</label>
                      <p>₹ {Number(transferForm.depositLiability || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <h3>New Agency Details</h3>

              <div className="transfer-fields two-column">
                <div>
                  <label>New Agency Name *</label>
                  <input name="newCustomerName" value={transferForm.newCustomerName} onChange={handleTransferNewAgencyNameChange} placeholder="e.g. Bharat Gas - MG Road" />
                </div>
                <div>
                  <label>Agency Mobile</label>
                  <input name="newCustomerMobile" value={transferForm.newCustomerMobile} onChange={handleTransferInputChange} />
                </div>
              </div>

              <div className="transfer-fields">
                <label>Agency Address</label>
                <input name="newCustomerAddress" value={transferForm.newCustomerAddress} onChange={handleTransferInputChange} />
              </div>

              <div className="transfer-fields">
                <label>Deposit / Liability (₹)</label>
                <input name="depositLiability" type="number" min="0" step="0.01" value={transferForm.depositLiability} onChange={handleTransferInputChange} />
              </div>

              <div className="transfer-fields">
                <label>Reason for Transfer *</label>
                <textarea name="reason" value={transferForm.reason} onChange={handleTransferInputChange} rows={3} />
              </div>

              <div className="transfer-fields">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="isRegulatorReceived"
                    checked={transferForm.isRegulatorReceived}
                    onChange={(event) =>
                      setTransferForm((previous) => ({ ...previous, isRegulatorReceived: event.target.checked }))
                    }
                  />
                  <span>Regulator received</span>
                </label>
              </div>

              <div className="transfer-fields">
                <label>Empty Cylinder Returned (optional)</label>
                <div className="autosuggest-wrap">
                  <input
                    name="emptyProductName"
                    value={transferForm.emptyProductName}
                    onChange={(e) => handleTransferEmptyProductSearch(e.target.value)}
                    placeholder="Search empty cylinder product…"
                    autoComplete="off"
                    onFocus={async () => {
                      if (!transferForm.emptyProductName.trim()) {
                        try {
                          const rows = await searchConnectionProducts("");
                          setTransferProductSuggestions(rows);
                        } catch (_error) {
                          setTransferProductSuggestions([]);
                        }
                      }
                    }}
                    onBlur={() => setTimeout(() => setTransferProductSuggestions([]), 200)}
                  />
                  {transferProductSuggestions.length ? (
                    <div className="autosuggest-dropdown">
                      {transferProductSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="autosuggest-item"
                          onClick={() => handleSelectTransferEmptyProduct(item)}
                        >
                          <strong>{item.name}</strong>
                          <span>{item.type}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {transferForm.emptyProductId ? (
                <div className="transfer-fields">
                  <label>Empty Cylinder Quantity</label>
                  <input
                    name="emptyCylinderQty"
                    type="number"
                    min="0"
                    step="1"
                    value={transferForm.emptyCylinderQty}
                    onChange={handleTransferInputChange}
                    placeholder="Number of empty cylinders"
                  />
                  <p className="field-hint">
                    This raises an empty-cylinder return request to the godown manager for approval.
                  </p>
                </div>
              ) : null}

              <div className="transfer-actions">
                <button type="button" className="primary-btn" disabled={transferSubmitting} onClick={handleSendTransferRequest}>
                  {transferSubmitting ? "Sending..." : "Send to Manager & Cashier"}
                </button>
              </div>
            </article>

            <aside className="recent-transfers-card">
              <h4>Recent Transfers</h4>
              {recentTransfersLoading ? <p className="muted">Loading transfers...</p> : null}
              {!recentTransfersLoading && !recentTransfers.length ? <p className="muted">No recent transfers yet.</p> : null}
              <div className="recent-transfers-list">
                {recentTransfers.map((item) => (
                  <article key={item.id} className="recent-transfer-row">
                    <div className="recent-row-head">
                      <p>{item.existing_customer_name || item.existing_name || "Customer"} → {item.new_agency_name || item.new_customer_name || item.new_name || "New Agency"}</p>
                      <span className={`payment-chip ${String(item.status || "PENDING_MANAGER").toLowerCase().replaceAll(" ", "-")}`}>
                        {String(item.status || "PENDING_MANAGER")
                          .replace(/_/g, " ")
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(" ")}
                      </span>
                    </div>
                    <p className="recent-row-meta">{item.reason || "-"}</p>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        ) : null}

        {activeMenu === "Name Change" ? (
          <section className="name-change-grid">
            <article className="name-change-form-card">
              <h3>Customer Name Change Request</h3>

              <div className="name-change-fields">
                <label>Consumer Number *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    name="consumerNumber"
                    value={nameChangeForm.consumerNumber}
                    onChange={handleNameChangeInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerNameChangeLookup(); } }}
                    placeholder="Enter Consumer Number (e.g. 7000000000965566 or LPG-00012)"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={triggerNameChangeLookup}
                    disabled={nameChangeLookupLoading || !nameChangeForm.consumerNumber.trim()}
                  >
                    {nameChangeLookupLoading ? "Searching..." : "🔍 Search"}
                  </button>
                </div>
              </div>

              {nameChangeLookupLoading ? <p className="muted">Looking up customer records...</p> : null}

              {nameChangeForm.existingCustomerId ? (
                <div className="loaded-customer-card" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, color: "#166534" }}>✓ Registered Customer Verified</h4>
                    <span className="payment-chip paid">Found</span>
                  </div>
                  <div className="customer-profile-grid" style={{ marginTop: "0.75rem" }}>
                    <div>
                      <label>Current Registered Name</label>
                      <p><strong>{nameChangeForm.existingName}</strong></p>
                    </div>
                    <div>
                      <label>Consumer Number</label>
                      <p>{nameChangeForm.consumerNumber}</p>
                    </div>
                    <div>
                      <label>Phone</label>
                      <p>{nameChangeForm.existingCustomerPhone || "-"}</p>
                    </div>
                    <div>
                      <label>Current Registered Address</label>
                      <p>{nameChangeForm.existingCustomerAddress || "Address on record"}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="name-change-fields two-column">
                <div>
                  <label>New Name Requested *</label>
                  <input
                    name="newName"
                    value={nameChangeForm.newName}
                    onChange={handleNameChangeInputChange}
                    placeholder="Enter new legal / applicant name"
                  />
                </div>
                <div>
                  <label>Service Fee (₹)</label>
                  <input
                    name="serviceFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={nameChangeForm.serviceFee}
                    onChange={handleNameChangeInputChange}
                  />
                </div>
              </div>

              <div className="name-change-fields">
                <label className="checkbox-field" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="isSameAddress"
                    checked={nameChangeForm.isSameAddress}
                    onChange={(e) => setNameChangeForm((prev) => ({ ...prev, isSameAddress: e.target.checked }))}
                  />
                  <span><strong>Same Address</strong> (Retain current registered address)</span>
                </label>
                {nameChangeForm.isSameAddress ? (
                  <p className="field-hint" style={{ color: "#2e7d32", marginTop: "4px" }}>
                    ✓ Current registered address will be retained without re-entering: <em>{nameChangeForm.existingCustomerAddress || "Retained from customer record"}</em>
                  </p>
                ) : (
                  <div style={{ marginTop: "0.6rem" }}>
                    <label>New Registered Address *</label>
                    <input
                      name="newAddress"
                      value={nameChangeForm.newAddress}
                      onChange={(e) => setNameChangeForm((prev) => ({ ...prev, newAddress: e.target.value }))}
                      placeholder="Enter new customer address"
                    />
                  </div>
                )}
              </div>

              <div className="name-change-fields">
                <label>Supporting Document *</label>
                <label className="upload-field">
                  <input type="file" accept="image/*,application/pdf" onChange={handleNameChangeDocumentUpload} />
                  <span>{nameChangeForm.documentLabel ? `Selected file: ${nameChangeForm.documentLabel}` : "Upload affidavit / marriage certificate / gazette"}</span>
                </label>
                {nameChangeForm.documentUrl ? <p className="upload-success">Document uploaded successfully.</p> : null}
              </div>

              <div className="name-change-actions">
                <button type="button" className="primary-btn" disabled={nameChangeSubmitting} onClick={handleCreateNameChangeRequest}>
                  {nameChangeSubmitting ? "Creating..." : "Create Request"}
                </button>
              </div>
            </article>

            <aside className="recent-name-changes-card">
              <h4>Recent Requests</h4>
              {recentNameChangesLoading ? <p className="muted">Loading requests...</p> : null}
              {!recentNameChangesLoading && !recentNameChanges.length ? <p className="muted">No name change requests yet.</p> : null}
              <div className="recent-name-changes-list">
                {recentNameChanges.map((item) => (
                  <article key={item.id} className="recent-name-change-row">
                    <div className="recent-row-head">
                      <p>{item.existing_name || "Customer"} → {item.new_name_requested || item.new_name || "New Name"}</p>
                      <span className={`payment-chip ${(item.approval_status || "PENDING").toLowerCase()}`}>
                        {item.approval_status === "APPROVED" ? "Approved" : item.approval_status === "REJECTED" ? "Rejected" : "Pending"}
                      </span>
                    </div>
                    <p className="recent-row-meta">{item.consumer_number || "-"} • ₹ {Number(item.service_fee || 0).toFixed(2)}</p>
                    {item.document_url ? <p className="recent-row-meta">Document uploaded</p> : null}
                  </article>
                ))}
              </div>
            </aside>
          </section>
        ) : null}

        {activeMenu === "PR Penalty" ? (
          <section className="pr-penalty-grid">
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="pr-stock-banner" style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                <div className="pr-stock-chip normal" style={{ flex: 1, padding: "1rem 1.25rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Normal PR Stock (Sound / Available)</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#14532d", marginTop: "4px" }}>{prStockSummary.normalPrStock} <span style={{ fontSize: "1rem", fontWeight: 500 }}>units</span></div>
                  <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "2px" }}>Decrements by 1 on issue / replacement</div>
                </div>
                <div className="pr-stock-chip defective" style={{ flex: 1, padding: "1rem 1.25rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Defective PR Stock (Returned / Scrap)</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#7f1d1d", marginTop: "4px" }}>{prStockSummary.defectivePrStock} <span style={{ fontSize: "1rem", fontWeight: 500 }}>units</span></div>
                  <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "2px" }}>Increments by 1 on defective customer return</div>
                </div>
              </div>
            </div>

            <article className="pr-penalty-form-card">
              <h3>PR Stock Movement & Penalty Record</h3>

              <div className="pr-penalty-fields" style={{ background: "#fbfaf8", padding: "0.85rem", borderRadius: "8px", border: "1px solid #ede8e3" }}>
                <label style={{ fontWeight: 600, color: "#1f1b18" }}>Movement / Transaction Type *</label>
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.4rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="transactionType"
                      value="REPLACEMENT"
                      checked={prPenaltyForm.transactionType === "REPLACEMENT"}
                      onChange={() => setPrPenaltyForm((prev) => ({
                        ...prev,
                        transactionType: "REPLACEMENT",
                        penaltyReason: "Defective PR replacement",
                        penaltyAmount: "0"
                      }))}
                    />
                    <span><strong>PR Replacement</strong> (Customer returned defective PR)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="transactionType"
                      value="PENALTY"
                      checked={prPenaltyForm.transactionType === "PENALTY"}
                      onChange={() => setPrPenaltyForm((prev) => ({
                        ...prev,
                        transactionType: "PENALTY",
                        penaltyReason: "Lost PR / Penalty Fee",
                        penaltyAmount: "150"
                      }))}
                    />
                    <span><strong>Lost PR / Penalty Fee</strong> (Regulator missing / damaged)</span>
                  </label>
                </div>
              </div>

              <div className="pr-penalty-fields two-column" style={{ marginTop: "0.75rem" }}>
                <div>
                  <label>Consumer Number *</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      name="consumerNumber"
                      value={prPenaltyForm.consumerNumber}
                      onChange={handlePrPenaltyInputChange}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerPenaltyLookup(); } }}
                      placeholder="LPG-00004 or 7000..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={triggerPenaltyLookup}
                      disabled={prPenaltyLookupLoading || !prPenaltyForm.consumerNumber.trim()}
                    >
                      {prPenaltyLookupLoading ? "..." : "🔍"}
                    </button>
                  </div>
                </div>
                <div>
                  <label>Customer Name *</label>
                  <div className="autosuggest-wrap">
                    <input
                      name="customerName"
                      value={prPenaltyForm.customerName}
                      onChange={handlePrPenaltyCustomerNameChange}
                      placeholder="Enter customer name"
                    />
                    {activeSuggestionField === "pr-penalty" && customerNameSuggestions.length ? (
                      <div className="autosuggest-dropdown">
                        {customerNameSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="autosuggest-item"
                            onClick={() => handleSelectSuggestedCustomer("pr-penalty", item)}
                          >
                            <strong>{item.name || "Customer"}</strong>
                            <span>{item.consumer_number || "-"} • {item.phone || "-"}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {prPenaltyLookupLoading ? <p className="muted">Looking up customer...</p> : null}

              <div className="pr-penalty-fields two-column">
                <div>
                  <label>Reason / Description *</label>
                  <input
                    name="penaltyReason"
                    value={prPenaltyForm.penaltyReason}
                    onChange={handlePrPenaltyInputChange}
                    placeholder="Enter reason"
                  />
                </div>
                <div>
                  <label>Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={prPenaltyForm.quantity || "1"}
                    onChange={handlePrPenaltyInputChange}
                  />
                </div>
              </div>

              <div className="pr-penalty-fields pr-penalty-amount-row">
                <div>
                  <label>Amount / Penalty Fee (₹)</label>
                  <input
                    name="penaltyAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prPenaltyForm.penaltyAmount}
                    onChange={handlePrPenaltyInputChange}
                  />
                  <p className="field-hint">
                    {prPenaltyForm.transactionType === "REPLACEMENT"
                      ? "₹0 for warranty / standard replacement. Normal PR stock will decrease by 1, Defective PR will increase by 1."
                      : "Normal PR stock will decrease by 1 upon issuing new PR to customer."}
                  </p>
                </div>
              </div>

              <div className="pr-penalty-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={prPenaltySubmitting}
                  onClick={handleRecordPenalty}
                >
                  {prPenaltySubmitting
                    ? "Recording..."
                    : prPenaltyForm.transactionType === "REPLACEMENT"
                    ? "Record PR Replacement & Update Stock"
                    : "Record Lost PR Penalty & Issue"}
                </button>
              </div>
            </article>

            <aside className="pr-penalty-list-card">
              <h4>Penalties</h4>
              {recentPenaltiesLoading ? <p className="muted">Loading penalties...</p> : null}
              {!recentPenaltiesLoading && !recentPenalties.length ? (
                <p className="muted">No penalties yet.</p>
              ) : null}

              <div className="pr-penalty-list">
                {recentPenalties.map((item) => {
                  const isPaid = String(item.payment_status || "UNPAID").toUpperCase() === "PAID";
                  return (
                    <article key={item.id} className="pr-penalty-row">
                      <div className="recent-row-head">
                        <p>{item.customer_name || "Customer"}</p>
                        <span className={`payment-chip ${isPaid ? "paid" : "unpaid"}`}>
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>

                      <p className="recent-row-meta">
                        {item.consumer_number || "-"} · {item.penalty_reason || "-"}
                      </p>

                      <div className="pr-penalty-row-footer">
                        <p className="recent-row-amount">₹ {Number(item.penalty_amount || 0).toFixed(0)}</p>
                        {!isPaid ? (
                          <button
                            type="button"
                            className="secondary-btn pr-penalty-mark-btn"
                            onClick={() => handleMarkPenaltyPaid(item.id)}
                          >
                            Mark Paid
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>
          </section>
        ) : null}



        {activeMenu === "IOC OTPs" ? (
          <section className="ioc-otp-section">
            {showAddOtpForm ? (
              <div className="ioc-add-form">
                <div>
                  <label>Sale ID</label>
                  <input
                    value={addOtpSaleId}
                    onChange={(event) => setAddOtpSaleId(event.target.value)}
                    placeholder="Enter sale id"
                  />
                </div>
                <div>
                  <label>OTP</label>
                  <input
                    value={addOtpValue}
                    onChange={(event) => setAddOtpValue(event.target.value)}
                    placeholder="Enter OTP"
                  />
                </div>
                <div className="ioc-add-form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setShowAddOtpForm(false)}>
                    Cancel
                  </button>
                  <button type="button" className="primary-btn" onClick={handleAddIocOtp} disabled={addOtpSubmitting}>
                    {addOtpSubmitting ? "Adding..." : "Save OTP"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="ioc-cards-grid">
              <article className="ioc-card received">
                <p>Today - Received</p>
                <strong>{iocOtpSummary.todayReceived}</strong>
              </article>
              <article className="ioc-card pending">
                <p>Today - Pending</p>
                <strong>{iocOtpSummary.todayPending}</strong>
              </article>
              <article className="ioc-card sent">
                <p>Today - Sent to IOC</p>
                <strong>{iocOtpSummary.todaySent}</strong>
              </article>
              <article className="ioc-card allpending">
                <p>All Pending</p>
                <strong>{iocOtpSummary.allPending}</strong>
              </article>
            </div>

            <div className="ioc-list-card">
              <div className="ioc-list-topbar">
                <div className="ioc-tabs">
                  <button
                    type="button"
                    className={`ioc-tab ${iocOtpTab === "PENDING" ? "active" : ""}`}
                    onClick={() => handleIocOtpTabChange("PENDING")}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className={`ioc-tab ${iocOtpTab === "SENT" ? "active" : ""}`}
                    onClick={() => handleIocOtpTabChange("SENT")}
                  >
                    Sent
                  </button>
                  <button
                    type="button"
                    className={`ioc-tab ${iocOtpTab === "ALL" ? "active" : ""}`}
                    onClick={() => handleIocOtpTabChange("ALL")}
                  >
                    All
                  </button>
                </div>

                <div className="ioc-filters">
                  <input type="date" value={iocOtpDate} onChange={(event) => setIocOtpDate(event.target.value)} />
                  <select value={iocOtpDriverFilter} onChange={(event) => setIocOtpDriverFilter(event.target.value)}>
                    <option value="ALL">All drivers</option>
                    {iocDriverOptions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleDownloadIocOtpsSheet}
                    title="Download IOC OTPs as CSV"
                  >
                    ↓ Download Sheet
                  </button>
                </div>
              </div>

              <div className="ioc-table-wrap">
                <table className="ioc-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Driver</th>
                      <th>Customer</th>
                      <th>Consumer #</th>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Settlement</th>
                      <th>Category</th>
                      <th>OTP</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iocOtpsLoading ? (
                      <tr>
                        <td colSpan={11}>Loading OTPs...</td>
                      </tr>
                    ) : null}

                    {!iocOtpsLoading && !iocOtps.length ? (
                      <tr>
                        <td colSpan={11}>No OTPs found.</td>
                      </tr>
                    ) : null}

                    {!iocOtpsLoading
                      ? iocOtps.map((item) => {
                          const isPending = String(item.status || "PENDING").toUpperCase() === "PENDING";
                          return (
                            <tr key={item.id}>
                              <td>{item.created_at_formatted}</td>
                              <td>{item.driver_name || "-"}</td>
                              <td>{item.customer_name || "-"}</td>
                              <td>{item.consumer_number || "-"}</td>
                              <td><strong>{item.item_name || "14.2 KG Domestic"}</strong></td>
                              <td>{item.quantity || 1}</td>
                              <td>
                                <span className={`settlement-badge ${String(item.settlement || "Direct").toLowerCase()}`}>
                                  {item.settlement || "Direct"}
                                </span>
                              </td>
                              <td>{item.category || "-"}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <strong>{item.otp}</strong>
                                  {item.otp !== "OTP Skipped" && (
                                    <button
                                      type="button"
                                      title="Copy OTP"
                                      className="ioc-copy-btn"
                                      onClick={() => handleCopyOtp(item.otp)}
                                    >
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                      </svg>
                                      <span>Copy</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`payment-chip ${isPending ? "unpaid" : "paid"}`}>
                                  {isPending ? "Pending" : "Sent"}
                                </span>
                              </td>
                              <td>
                                {isPending ? (
                                  <button
                                    type="button"
                                    className="secondary-btn ioc-sent-btn"
                                    onClick={() => handleMarkOtpSent(item.id)}
                                  >
                                    Sent
                                  </button>
                                ) : (
                                  <span className="muted">Done</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {activeMenu === "Customers" ? (
          <section className="customers-dashboard-grid">
            <aside className="customers-directory-card">
              <div className="customers-directory-head">
                <h4>Customers</h4>
                <button type="button" className="secondary-btn" onClick={handleClearCustomerSelection}>
                  Clear
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <BulkCustomerUpload onUploadComplete={() => {
                  setCustomerDirectorySearch((prev) => (prev.endsWith(" ") ? prev.trim() : prev + " "));
                }} />
              </div>

              <input
                className="customers-search-input"
                value={customerDirectorySearch}
                onChange={(event) => setCustomerDirectorySearch(event.target.value)}
                placeholder="Search customer by name, mobile or consumer #"
              />

              {customerDirectoryLoading ? <p className="muted">Loading customers...</p> : null}

              <div className="customers-directory-list">
                {!customerDirectoryLoading && !customerDirectory.length ? <p className="muted">No customers found.</p> : null}

                {customerDirectory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`customers-directory-item ${Number(selectedDashboardCustomerId) === Number(item.id) ? "active" : ""}`}
                    onClick={() => setSelectedDashboardCustomerId(Number(item.id))}
                  >
                    <p className="customers-directory-name">{item.name || "Customer"}</p>
                    <p className="customers-directory-meta">{item.consumer_number || "-"}</p>
                    <p className="customers-directory-meta">{item.phone || "-"}</p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="customers-details-card">
              {!selectedDashboardCustomerId ? (
                <p className="muted">Select a customer from the left list to view details.</p>
              ) : null}

              {customerDashboardLoading ? <p className="muted">Loading customer details...</p> : null}

              {customerDashboardDetails && !customerDashboardLoading ? (
                <>
                  <article className="customer-profile-panel">
                    <h3>Customer Details</h3>
                    <div className="customer-profile-grid">
                      <div>
                        <label>Name</label>
                        <p>{customerDashboardDetails.profile?.name || "-"}</p>
                      </div>
                      <div>
                        <label>Consumer Number</label>
                        <p>{customerDashboardDetails.profile?.consumer_number || "-"}</p>
                      </div>
                      <div>
                        <label>Phone</label>
                        <p>{customerDashboardDetails.profile?.phone || "-"}</p>
                      </div>
                      <div>
                        <label>Address</label>
                        <p>{customerDashboardDetails.profile?.address || "-"}</p>
                      </div>
                    </div>
                  </article>

                  <article className="customer-history-panel">
                    <h4>Complaint History</h4>
                    <div className="customer-history-table-wrap">
                      <table className="customer-history-table">
                        <thead>
                          <tr>
                            <th>Issue</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!customerDashboardDetails.complaintHistory?.length ? (
                            <tr>
                              <td colSpan={4}>No complaints found.</td>
                            </tr>
                          ) : (
                            customerDashboardDetails.complaintHistory.map((item) => (
                              <tr key={item.id}>
                                <td>{item.issueType || "-"}</td>
                                <td>{item.description || "-"}</td>
                                <td>{item.status || "-"}</td>
                                <td>{getDaysAgo(item.createdAt)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="customer-history-panel">
                    <h4>Request History</h4>
                    <div className="customer-history-table-wrap">
                      <table className="customer-history-table">
                        <thead>
                          <tr>
                            <th>Request</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!customerDashboardDetails.requestHistory?.length ? (
                            <tr>
                              <td colSpan={4}>No requests found.</td>
                            </tr>
                          ) : (
                            customerDashboardDetails.requestHistory.map((item) => (
                              <tr key={item.id}>
                                <td>{item.title || "-"}</td>
                                <td>{item.description || "-"}</td>
                                <td>{item.status || "-"}</td>
                                <td>{getDaysAgo(item.createdAt)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="customer-history-panel">
                    <h4>Payment Status</h4>
                    <div className="customer-history-table-wrap">
                      <table className="customer-history-table">
                        <thead>
                          <tr>
                            <th>Penalty Reason</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!customerDashboardDetails.paymentStatus?.length ? (
                            <tr>
                              <td colSpan={4}>No payment records found.</td>
                            </tr>
                          ) : (
                            customerDashboardDetails.paymentStatus.map((item) => (
                              <tr key={item.id}>
                                <td>{item.reason || "-"}</td>
                                <td>₹ {Number(item.amount || 0).toFixed(2)}</td>
                                <td>{item.status || "-"}</td>
                                <td>{getDaysAgo(item.createdAt)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </>
              ) : null}
            </section>
          </section>
        ) : null}

        {activeMenu === "Reports" ? (
          <section className="reports-section" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="reports-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #e8e4df", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6c635b", marginRight: "0.25rem" }}>Timeframe:</span>
                <button
                  type="button"
                  className={`reports-filter-btn ${reportsTimeframe === "day" ? "active" : ""}`}
                  onClick={() => setReportsTimeframe("day")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`reports-filter-btn ${reportsTimeframe === "week" ? "active" : ""}`}
                  onClick={() => setReportsTimeframe("week")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`reports-filter-btn ${reportsTimeframe === "month" ? "active" : ""}`}
                  onClick={() => setReportsTimeframe("month")}
                >
                  This Month
                </button>
                <button
                  type="button"
                  className={`reports-filter-btn ${reportsTimeframe === "custom" ? "active" : ""}`}
                  onClick={() => setReportsTimeframe("custom")}
                >
                  Custom Range
                </button>

                {reportsTimeframe === "custom" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem" }}>
                    <input
                      type="date"
                      value={reportsStartDate}
                      onChange={(e) => setReportsStartDate(e.target.value)}
                      style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #d5cfc9", fontSize: "0.85rem" }}
                    />
                    <span style={{ color: "#7b7269", fontSize: "0.85rem" }}>to</span>
                    <input
                      type="date"
                      value={reportsEndDate}
                      onChange={(e) => setReportsEndDate(e.target.value)}
                      style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #d5cfc9", fontSize: "0.85rem" }}
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleDownloadReportCsv}
                  title="Export current report to CSV"
                >
                  ↓ Download Report (CSV)
                </button>
              </div>
            </div>

            <div className="reports-nav-bar" style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid #e8e4df" }}>
              <button
                type="button"
                className={`reports-nav-tab ${activeReportTab === "sales" ? "active" : ""}`}
                onClick={() => setActiveReportTab("sales")}
              >
                📊 Sales Report
              </button>
              <button
                type="button"
                className={`reports-nav-tab ${activeReportTab === "movement" ? "active" : ""}`}
                onClick={() => setActiveReportTab("movement")}
              >
                🔄 Customer Movement
              </button>
              <button
                type="button"
                className={`reports-nav-tab ${activeReportTab === "complaints" ? "active" : ""}`}
                onClick={() => setActiveReportTab("complaints")}
              >
                🛠️ Complaints Report
              </button>
              <button
                type="button"
                className={`reports-nav-tab ${activeReportTab === "otp" ? "active" : ""}`}
                onClick={() => setActiveReportTab("otp")}
              >
                🔐 OTP Verification
              </button>
            </div>

            {reportsLoading ? (
              <div className="reports-table-card">
                <p className="muted" style={{ padding: "2rem", textAlign: "center" }}>Loading report data...</p>
              </div>
            ) : null}

            {!reportsLoading && activeReportTab === "sales" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="reports-kpi-grid">
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Total Cylinders Sold</span>
                    <strong className="reports-kpi-value">{salesReportData?.summary?.total_cylinders || 0}</strong>
                  </article>
                  {/* <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Total Revenue</span>
                    <strong className="reports-kpi-value">₹ {Number(salesReportData?.summary?.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                  </article> */}
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Direct Settlements</span>
                    <strong className="reports-kpi-value" style={{ color: "#059669" }}>₹ {Number(salesReportData?.summary?.direct_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Indirect / Cash Settlements</span>
                    <strong className="reports-kpi-value" style={{ color: "#d97706" }}>₹ {Number(salesReportData?.summary?.indirect_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                  </article>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>Sales Transactions ({salesReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Sale ID</th>
                          <th>Date / Time</th>
                          <th>Customer</th>
                          <th>Consumer #</th>
                          <th>Items</th>
                          <th>Qty</th>
                          <th>Amount</th>
                          <th>Mode</th>
                          <th>Settlement</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!salesReportData?.salesList?.length ? (
                          <tr><td colSpan={10} style={{ textAlign: "center", padding: "1.5rem" }}>No sales records found for this period.</td></tr>
                        ) : (
                          salesReportData.salesList.map((s) => (
                            <tr key={s.id}>
                              <td>#{s.id}</td>
                              <td>{s.date_formatted}</td>
                              <td>{s.customer_name || "-"}</td>
                              <td>{s.consumer_number || "-"}</td>
                              <td>{s.items || "14.2 KG Domestic"}</td>
                              <td>{s.total_qty || 1}</td>
                              <td><strong>₹ {Number(s.total_amount || 0).toFixed(2)}</strong></td>
                              <td><span className="payment-chip info">{s.payment_method || "CASH"}</span></td>
                              <td>
                                <span className={`settlement-badge ${String(s.settlement || "Direct").toLowerCase()}`}>
                                  {s.settlement || "Direct"}
                                </span>
                              </td>
                              <td><span className="payment-chip paid">{s.status || "DELIVERED"}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {!reportsLoading && activeReportTab === "movement" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="reports-kpi-grid">
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Total Movements</span>
                    <strong className="reports-kpi-value">{movementReportData?.summary?.totalMovementCount || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">New Connections</span>
                    <strong className="reports-kpi-value" style={{ color: "#2563eb" }}>{movementReportData?.summary?.newConnectionsCount || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Transfers Out</span>
                    <strong className="reports-kpi-value" style={{ color: "#d97706" }}>{movementReportData?.summary?.transfersCount || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Name Changes</span>
                    <strong className="reports-kpi-value" style={{ color: "#7c3aed" }}>{movementReportData?.summary?.nameChangesCount || 0}</strong>
                  </article>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>New Connections ({movementReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Phone</th>
                          <th>Consumer #</th>
                          <th>Package</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!movementReportData?.newConnections?.length ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: "1.2rem" }}>No new connections registered in this period.</td></tr>
                        ) : (
                          movementReportData.newConnections.map((c) => (
                            <tr key={c.id}>
                              <td>{c.date_formatted}</td>
                              <td><strong>{c.customer_name}</strong></td>
                              <td>{c.phone || "-"}</td>
                              <td>{c.consumer_number || "-"}</td>
                              <td>{c.product_details || "Standard Connection"}</td>
                              <td>₹ {Number(c.total_amount || 0).toFixed(2)}</td>
                              <td><span className="payment-chip paid">{c.payment_status || "COMPLETED"}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>Transfers ({movementReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Consumer #</th>
                          <th>Target Agency</th>
                          <th>Deposit Liability</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!movementReportData?.transfers?.length ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: "1.2rem" }}>No transfers initiated in this period.</td></tr>
                        ) : (
                          movementReportData.transfers.map((t) => (
                            <tr key={t.id}>
                              <td>{t.date_formatted}</td>
                              <td><strong>{t.old_customer_name}</strong></td>
                              <td>{t.consumer_number || "-"}</td>
                              <td>{t.new_agency_name || "New Agency"}</td>
                              <td>₹ {Number(t.deposit_liability || 0).toFixed(2)}</td>
                              <td>{t.reason || "-"}</td>
                              <td><span className="payment-chip pending">{t.status || "PENDING"}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>Name Changes ({movementReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Consumer #</th>
                          <th>Previous Name</th>
                          <th>New Name Requested</th>
                          <th>Fee</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!movementReportData?.nameChanges?.length ? (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: "1.2rem" }}>No name changes in this period.</td></tr>
                        ) : (
                          movementReportData.nameChanges.map((nc) => (
                            <tr key={nc.id}>
                              <td>{nc.date_formatted}</td>
                              <td>{nc.consumer_number || "-"}</td>
                              <td>{nc.old_name_snapshot}</td>
                              <td><strong>{nc.new_name_requested}</strong></td>
                              <td>₹ {Number(nc.service_fee || 0).toFixed(2)}</td>
                              <td><span className="payment-chip info">{nc.status || "PENDING"}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {!reportsLoading && activeReportTab === "complaints" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="reports-kpi-grid">
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Total Complaints</span>
                    <strong className="reports-kpi-value">{complaintsReportData?.summary?.total || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Resolved</span>
                    <strong className="reports-kpi-value" style={{ color: "#059669" }}>{complaintsReportData?.summary?.resolved || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Pending / In Progress</span>
                    <strong className="reports-kpi-value" style={{ color: "#d97706" }}>{(complaintsReportData?.summary?.pending || 0) + (complaintsReportData?.summary?.in_progress || 0)}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Urgent / Leakage</span>
                    <strong className="reports-kpi-value" style={{ color: "#dc2626" }}>{complaintsReportData?.summary?.urgent || 0}</strong>
                  </article>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>Complaints Log ({complaintsReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Complaint #</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Consumer #</th>
                          <th>Issue Category</th>
                          <th>Description</th>
                          <th>Driver Assigned</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!complaintsReportData?.complaintsList?.length ? (
                          <tr><td colSpan={8} style={{ textAlign: "center", padding: "1.5rem" }}>No complaints logged for this period.</td></tr>
                        ) : (
                          complaintsReportData.complaintsList.map((c) => (
                            <tr key={c.id}>
                              <td>#{c.complaint_number || c.id}</td>
                              <td>{c.date_formatted}</td>
                              <td><strong>{c.customer_name || "-"}</strong></td>
                              <td>{c.consumer_number || "-"}</td>
                              <td><span className={`payment-chip ${c.category === "Leakage" ? "unpaid" : "info"}`}>{c.category || "-"}</span></td>
                              <td>{c.description || "-"}</td>
                              <td>{c.assigned_driver || "Unassigned"}</td>
                              <td><span className={`payment-chip ${c.status === "RESOLVED" ? "paid" : "pending"}`}>{c.status}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {!reportsLoading && activeReportTab === "otp" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="reports-kpi-grid">
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Total OTPs</span>
                    <strong className="reports-kpi-value">{otpReportData?.summary?.total_otps || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Sent to IOC</span>
                    <strong className="reports-kpi-value" style={{ color: "#059669" }}>{otpReportData?.summary?.sent_otps || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Pending</span>
                    <strong className="reports-kpi-value" style={{ color: "#d97706" }}>{otpReportData?.summary?.pending_otps || 0}</strong>
                  </article>
                  <article className="reports-kpi-card">
                    <span className="reports-kpi-label">Verification Rate</span>
                    <strong className="reports-kpi-value" style={{ color: "#2563eb" }}>{otpReportData?.summary?.verificationRate || "0%"}</strong>
                  </article>
                </div>

                <div className="reports-table-card">
                  <h4 style={{ margin: 0 }}>OTP Verifications ({otpReportData?.filter || "Today"})</h4>
                  <div className="ioc-table-wrap">
                    <table className="ioc-table">
                      <thead>
                        <tr>
                          <th>Date / Time</th>
                          <th>Driver</th>
                          <th>Customer</th>
                          <th>Consumer #</th>
                          <th>Item Name</th>
                          <th>Qty</th>
                          <th>Settlement</th>
                          <th>OTP</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!otpReportData?.otpsList?.length ? (
                          <tr><td colSpan={9} style={{ textAlign: "center", padding: "1.5rem" }}>No OTP records found for this period.</td></tr>
                        ) : (
                          otpReportData.otpsList.map((o) => (
                            <tr key={o.id}>
                              <td>{o.date_formatted}</td>
                              <td>{o.driver_name || "-"}</td>
                              <td><strong>{o.customer_name || "-"}</strong></td>
                              <td>{o.consumer_number || "-"}</td>
                              <td>{o.item_name || "14.2 KG Domestic"}</td>
                              <td>{o.quantity || 1}</td>
                              <td>
                                <span className={`settlement-badge ${String(o.settlement || "Direct").toLowerCase()}`}>
                                  {o.settlement || "Direct"}
                                </span>
                              </td>
                              <td><strong>{o.otp}</strong></td>
                              <td><span className={`payment-chip ${o.status === "SENT" ? "paid" : "unpaid"}`}>{o.status}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeMenu !== "Dashboard" && activeMenu !== "Complaints" && activeMenu !== "New Connection" && activeMenu !== "Transfer" && activeMenu !== "Name Change" && activeMenu !== "PR Penalty" && activeMenu !== "IOC OTPs" && activeMenu !== "Customers" && activeMenu !== "Reports" ? (
          <section className="panel placeholder-panel">
            <p className="muted">{activeMenu} module will be connected next.</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

function App() {
  const [authUser, setAuthUser] = useState(() =>
    localStorage.getItem(AUTH_TOKEN_KEY) ? readStoredUser() : null
  );

  const handleLoggedIn = (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setAuthUser(user);
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAuthUser(null);
  };

  if (!authUser) {
    return <Login onLoggedIn={handleLoggedIn} />;
  }

  return <Dashboard onSignOut={handleSignOut} />;
}

export default App;

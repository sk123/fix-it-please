// === Repair Requests ===
const REPAIR_KEY = 'tenant_toolbox_repair_requests';

export function saveRepairRequest(requestData) {
    try {
        const existing = getRepairRequests();
        const newRequest = {
            ...requestData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            communications: [], // Track SMS/Email events
        };
        localStorage.setItem(REPAIR_KEY, JSON.stringify([newRequest, ...existing]));
        return newRequest;
    } catch (error) {
        console.error('Failed to save repair request', error);
        return null;
    }
}

export function getRepairRequests() {
    try {
        const str = localStorage.getItem(REPAIR_KEY);
        return str ? JSON.parse(str) : [];
    } catch { return []; }
}

export function updateRepairStatus(id, status) {
    try {
        const records = getRepairRequests();
        const updated = records.map(r => r.id === id ? { ...r, status } : r);
        localStorage.setItem(REPAIR_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to update status', error);
    }
}

export function logCommunication(requestId, method, content, extras = {}) {
    try {
        const records = getRepairRequests();
        const updated = records.map(r => {
            if (r.id === requestId) {
                const comms = r.communications || [];
                return {
                    ...r,
                    communications: [
                        {
                            id: crypto.randomUUID(),
                            timestamp: new Date().toISOString(),
                            method,
                            direction: extras.direction || 'sent',
                            content: content || '',
                            summary: extras.summary || '',
                            imageDataUrl: extras.imageDataUrl || null,
                        },
                        ...comms
                    ]
                };
            }
            return r;
        });
        localStorage.setItem(REPAIR_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to log communication', error);
    }
}

export function logManualCorrespondence(requestId, { direction = 'received', method = 'text', summary = '', imageDataUrl = null, timestamp = null }) {
    try {
        const records = getRepairRequests();
        const updated = records.map(r => {
            if (r.id === requestId) {
                const comms = r.communications || [];
                return {
                    ...r,
                    communications: [
                        {
                            id: crypto.randomUUID(),
                            timestamp: timestamp || new Date().toISOString(),
                            method,
                            direction,
                            content: '',
                            summary,
                            imageDataUrl,
                        },
                        ...comms
                    ]
                };
            }
            return r;
        });
        localStorage.setItem(REPAIR_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to log manual correspondence', error);
    }
}

// === Settings (landlord contact, etc.) ===
const SETTINGS_KEY = 'tenant_toolbox_settings';

export function getSettings() {
    try {
        const str = localStorage.getItem(SETTINGS_KEY);
        return str ? JSON.parse(str) : {};
    } catch { return {}; }
}

export function saveSettings(settings) {
    try {
        const existing = getSettings();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...existing, ...settings }));
    } catch (error) {
        console.error('Failed to save settings', error);
    }
}

// === Notes ===
const NOTES_KEY = 'tenant_toolbox_notes';

export function saveNote(noteData) {
    try {
        const existing = getNotes();
        const newNote = {
            ...noteData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(NOTES_KEY, JSON.stringify([newNote, ...existing]));
        return newNote;
    } catch (error) {
        console.error('Failed to save note', error);
        return null;
    }
}

export function getNotes() {
    try {
        const str = localStorage.getItem(NOTES_KEY);
        return str ? JSON.parse(str) : [];
    } catch { return []; }
}

export function deleteNote(id) {
    try {
        const notes = getNotes().filter(n => n.id !== id);
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error('Failed to delete note', error);
    }
}

// === Document Vault ===
const VAULT_KEY = 'tenant_toolbox_vault';

export function saveVaultItem(itemData) {
    try {
        const existing = getVaultItems();
        const newItem = {
            ...itemData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(VAULT_KEY, JSON.stringify([newItem, ...existing]));
        return newItem;
    } catch (error) {
        console.error('Failed to save vault item', error);
        return null;
    }
}

export function getVaultItems() {
    try {
        const str = localStorage.getItem(VAULT_KEY);
        return str ? JSON.parse(str) : [];
    } catch { return []; }
}

export function deleteVaultItem(id) {
    try {
        const items = getVaultItems().filter(i => i.id !== id);
        localStorage.setItem(VAULT_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to delete vault item', error);
    }
}

// === Rent Ledger ===
const RENT_KEY = 'tenant_toolbox_rent_payments';

export function saveRentPayment(paymentData) {
    try {
        const existing = getRentPayments();
        const newPayment = {
            ...paymentData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(RENT_KEY, JSON.stringify([newPayment, ...existing]));
        return newPayment;
    } catch (error) {
        console.error('Failed to save rent payment', error);
        return null;
    }
}

export function getRentPayments() {
    try {
        const str = localStorage.getItem(RENT_KEY);
        return str ? JSON.parse(str) : [];
    } catch { return []; }
}

export function deleteRentPayment(id) {
    try {
        const payments = getRentPayments().filter(p => p.id !== id);
        localStorage.setItem(RENT_KEY, JSON.stringify(payments));
    } catch (error) {
        console.error('Failed to delete rent payment', error);
    }
}

// === Condition Reports ===
const CONDITION_KEY = 'tenant_toolbox_condition_reports';

export function saveConditionReport(reportData) {
    try {
        const existing = getConditionReports();
        const newReport = {
            ...reportData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONDITION_KEY, JSON.stringify([newReport, ...existing]));
        return newReport;
    } catch (error) {
        console.error('Failed to save condition report', error);
        return null;
    }
}

export function getConditionReports() {
    try {
        const str = localStorage.getItem(CONDITION_KEY);
        return str ? JSON.parse(str) : [];
    } catch { return []; }
}

export function deleteConditionReport(id) {
    try {
        const reports = getConditionReports().filter(r => r.id !== id);
        localStorage.setItem(CONDITION_KEY, JSON.stringify(reports));
    } catch (error) {
        console.error('Failed to delete condition report', error);
    }
}

// === Premium / Subscription ===
// Removed - all features free

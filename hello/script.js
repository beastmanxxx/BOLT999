document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const extractedText = document.getElementById('extractedText');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Check if we have an image from the parent window
    if (window.opener && window.opener.paymentScreenshot) {
        const file = window.opener.paymentScreenshot;
        handleFiles([file]);
    }

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                displayPreview(file);
                extractText(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    function displayPreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'grid';
        };
        reader.readAsDataURL(file);
    }

    function extractPaymentInfo(text) {
        const paymentInfo = {
            amount: null,
            transactionId: null,
            utrNumber: null,
            orderId: null,
            date: null,
            time: null,
            sender: null,
            receiver: null,
            senderUpiId: null,
            receiverUpiId: null,
            paymentStatus: null
        };

        // Extract amount (looking for patterns like "Rs. 1000" or "₹1000" or "INR 1000")
        const amountPattern = /(?:Rs\.?|₹|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i;
        const amountMatch = text.match(amountPattern);
        if (amountMatch) {
            paymentInfo.amount = amountMatch[1];
        }

        // Extract transaction ID (looking for patterns like "TXN ID: 123456" or "Transaction ID: 123456")
        const txnPattern = /(?:TXN|Transaction)\s*ID:?\s*([A-Za-z0-9]+)/i;
        const txnMatch = text.match(txnPattern);
        if (txnMatch) {
            paymentInfo.transactionId = txnMatch[1];
        }

        // Extract UTR number (looking for patterns like "UTR: 123456" or "UTR No: 123456")
        const utrPattern = /(?:UTR|UTR\s*No):?\s*([A-Za-z0-9]+)/i;
        const utrMatch = text.match(utrPattern);
        if (utrMatch) {
            paymentInfo.utrNumber = utrMatch[1];
        }

        // Extract Order ID (looking for patterns like "Order ID: 123456" or "Order No: 123456")
        const orderPattern = /(?:Order|Order\s*ID|Order\s*No):?\s*([A-Za-z0-9]+)/i;
        const orderMatch = text.match(orderPattern);
        if (orderMatch) {
            paymentInfo.orderId = orderMatch[1];
        }

        // Extract date (looking for various date formats)
        const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i;
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
            paymentInfo.date = dateMatch[1];
        }

        // Extract time (looking for time patterns like "14:30" or "2:30 PM")
        const timePattern = /(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i;
        const timeMatch = text.match(timePattern);
        if (timeMatch) {
            paymentInfo.time = timeMatch[1];
        }

        // Extract sender (looking for patterns like "From: John" or "Sender: John")
        const senderPattern = /(?:From|Sender):?\s*([A-Za-z\s]+)/i;
        const senderMatch = text.match(senderPattern);
        if (senderMatch) {
            paymentInfo.sender = senderMatch[1].trim();
        }

        // Extract receiver (looking for patterns like "To: John" or "Receiver: John")
        const receiverPattern = /(?:To|Receiver):?\s*([A-Za-z\s]+)/i;
        const receiverMatch = text.match(receiverPattern);
        if (receiverMatch) {
            paymentInfo.receiver = receiverMatch[1].trim();
        }

        // Extract UPI IDs (looking for patterns like "UPI ID: example@upi" or "example@upi")
        const upiPattern = /(?:UPI\s*ID:?\s*)?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/g;
        const upiMatches = [...text.matchAll(upiPattern)];
        if (upiMatches.length >= 2) {
            paymentInfo.senderUpiId = upiMatches[0][1];
            paymentInfo.receiverUpiId = upiMatches[1][1];
        } else if (upiMatches.length === 1) {
            paymentInfo.senderUpiId = upiMatches[0][1];
        }

        // Extract payment status (looking for patterns like "Status: Successful" or "Payment Successful")
        const statusPattern = /(?:Status|Payment):?\s*(Successful|Failed|Pending|Success|Failed|Pending)/i;
        const statusMatch = text.match(statusPattern);
        if (statusMatch) {
            paymentInfo.paymentStatus = statusMatch[1].toLowerCase();
        }

        return paymentInfo;
    }

    function displayPaymentInfo(paymentInfo) {
        let html = '<div class="payment-info">';
        
        if (paymentInfo.amount) {
            html += `<div class="info-item"><strong>Amount:</strong> ₹${paymentInfo.amount}</div>`;
        }
        if (paymentInfo.transactionId) {
            html += `<div class="info-item"><strong>Transaction ID:</strong> ${paymentInfo.transactionId}</div>`;
        }
        if (paymentInfo.utrNumber) {
            html += `<div class="info-item"><strong>UTR Number:</strong> ${paymentInfo.utrNumber}</div>`;
        }
        if (paymentInfo.orderId) {
            html += `<div class="info-item"><strong>Order ID:</strong> ${paymentInfo.orderId}</div>`;
        }
        if (paymentInfo.date) {
            html += `<div class="info-item"><strong>Date:</strong> ${paymentInfo.date}</div>`;
        }
        if (paymentInfo.time) {
            html += `<div class="info-item"><strong>Time:</strong> ${paymentInfo.time}</div>`;
        }
        if (paymentInfo.sender) {
            html += `<div class="info-item"><strong>Sender:</strong> ${paymentInfo.sender}</div>`;
        }
        if (paymentInfo.receiver) {
            html += `<div class="info-item"><strong>Receiver:</strong> ${paymentInfo.receiver}</div>`;
        }
        if (paymentInfo.senderUpiId) {
            html += `<div class="info-item"><strong>Sender UPI ID:</strong> ${paymentInfo.senderUpiId}</div>`;
        }
        if (paymentInfo.receiverUpiId) {
            html += `<div class="info-item"><strong>Receiver UPI ID:</strong> ${paymentInfo.receiverUpiId}</div>`;
        }
        if (paymentInfo.paymentStatus) {
            const statusClass = paymentInfo.paymentStatus === 'successful' || paymentInfo.paymentStatus === 'success' ? 'status-success' : 'status-failed';
            html += `<div class="info-item"><strong>Payment Status:</strong> <span class="${statusClass}">${paymentInfo.paymentStatus}</span></div>`;
        }

        if (!paymentInfo.amount && !paymentInfo.transactionId && !paymentInfo.utrNumber && 
            !paymentInfo.orderId && !paymentInfo.date && !paymentInfo.time && 
            !paymentInfo.sender && !paymentInfo.receiver && 
            !paymentInfo.senderUpiId && !paymentInfo.receiverUpiId && 
            !paymentInfo.paymentStatus) {
            html += '<p class="no-info">No payment information found in the image.</p>';
        }

        html += '</div>';
        return html;
    }

    async function extractText(file) {
        try {
            loadingIndicator.style.display = 'block';
            extractedText.innerHTML = '';

            const result = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            extractedText.innerHTML = `<p>Processing: ${Math.round(m.progress * 100)}%</p>`;
                        }
                    }
                }
            );

            const paymentInfo = extractPaymentInfo(result.data.text);
            extractedText.innerHTML = displayPaymentInfo(paymentInfo);
            
            // Send payment info back to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'PAYMENT_INFO',
                    paymentInfo: paymentInfo
                }, '*');
            }
        } catch (error) {
            extractedText.innerHTML = `<p class="error">Error extracting text: ${error.message}</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
}); 

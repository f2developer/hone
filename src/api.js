// frontend/src/api.js

/**
 * এই ফাংশনটি React অ্যাপ থেকে FastAPI backend এর '/predict' রুটে POST অনুরোধ পাঠায়।
 * ইনপুট হিসাবে ইউজারের প্রশ্ন পাঠানো হয় এবং Hugging Face মডেল থেকে পাওয়া রেজাল্ট ফেরত দেয়।
 */

// Frontend থেকে FastAPI backend-এ অনুরোধ পাঠানো
export async function queryBackend(prompt, context) {
  try {
    const response = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${context}\nপ্রশ্ন: ${prompt}\nউত্তর:`,
      }),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    // শুধুমাত্র answer key থেকে রেসপন্স নেওয়া
    return {
      answer: data?.answer || "কোনো উত্তর পাওয়া যায়নি।",
    };
  } catch (error) {
    console.error("Error querying backend:", error);
    return {
      answer: "সার্ভার থেকে উত্তর পাওয়া যায়নি।",
    };
  }
}


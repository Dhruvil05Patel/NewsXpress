# Performance & Load Testing – Apache JMeter

## 1. Introduction
This folder contains the **non-functional test scripts** created using **Apache JMeter**.  
JMeter is used for load testing, stress testing, and evaluating system performance under heavy traffic.

---

## 2. Purpose
These tests help to measure:
- Response time  
- Throughput  
- Server performance  
- Load handling capacity  
- Stress behaviour  
- Scalability under varying user loads  

---

## 3. Tools & Environment
- **Tool:** Apache JMeter  
- **Version:** (add version here)  
- **Test Plan Type:** `.jmx` files  
- **Testing Elements:** Thread Groups, HTTP Requests, Timers, Listeners  
- **Project Type:** REST API / Web Application

---

## 4. How to Run the Tests
1. Install **Apache JMeter**.  
2. Launch JMeter using `JMeter.bat` (Windows) or `jmeter` (Mac/Linux).  
3. Load the `.jmx` test plan file from this folder.  
4. Configure:
   - Number of users (threads)  
   - Ramp-up time  
   - Loop count  
5. Click **Start** to execute the test.  
6. Analyse results using Listeners such as:
   - View Results Tree  
   - Summary Report  
   - Aggregate Report  
   - Response Time Graph  

---

## 5. Output
The test produces:
- Average response time  
- Min/Max latency  
- Error percentage  
- TPS (Throughput per second)  
- Load curve  
- Performance metrics summary  

---

## 6. Status
➡️ Non-functional testing setup is complete. Load and performance test execution is in progress.

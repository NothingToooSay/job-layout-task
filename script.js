document.addEventListener('DOMContentLoaded', async () => {
	// function for obtaining patient data from the server
	async function fetchPatientData() {
		const url = 'https://fedskillstest.coalitiontechnologies.workers.dev'
		const username = 'coalition'
		const password = 'skills-test'

		const credentials = btoa(`${username}:${password}`)
		// encoding credentials in base64

		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Basic ${credentials}`,
				},
			})

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`)
			}

			const data = await response.json()

			// search patient by name
			const jessicaTaylor = data.find(
				patient => patient.name === 'Jessica Taylor'
			)

			if (jessicaTaylor) {
				displayPatientInfo(jessicaTaylor)
			} else {
				console.error('Jessica is not defined in data')
			}
		} catch (error) {
			console.error('Fetch error:', error)
		}
	}

	// function for update the chart
	function updateBloodPressureChart(bloodPressure) {
		// months to display: october 2023 to march 2024
		const displayMonths = [
			'Oct, 2023',
			'Nov, 2023',
			'Dec, 2023',
			'Jan, 2024',
			'Feb, 2024',
			'Mar, 2024',
		]

		// filter blood pressure data for the displayed months
		const filteredBloodPressure = displayMonths
			.map(monthYear => {
				// split the string "Oct, 2023" into month and year
				const [month, year] = monthYear.split(', ')

				// format the full name of the month
				const fullMonthName = new Intl.DateTimeFormat('en-US', {
					month: 'long',
				}).format(new Date(`${month} 1, ${year}`))

				// find the blood pressure object for the given month and year
				return bloodPressure.find(
					bp => bp.month === fullMonthName && bp.year === parseInt(year)
				)
			})
			// filter the array, leaving only certain objects (not null or undefined)
			.filter(Boolean)

		// create chart from chartjs.org
		const ctx = document.getElementById('bloodPressureChart').getContext('2d')
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: displayMonths,
				datasets: [
					{
						label: 'Systolic',
						data: filteredBloodPressure.map(
							bp => bp.blood_pressure.systolic.value
						),
						borderColor: '#C26EB4',
						backgroundColor: '#E66FD2',
						borderWidth: 2,
						fill: false,
						pointBackgroundColor: '#E66FD2',
						pointBorderColor: '#C26EB4',
						pointRadius: 5,
					},
					{
						label: 'Diastolic',
						data: filteredBloodPressure.map(
							bp => bp.blood_pressure.diastolic.value
						),
						borderColor: '#7E6CAB',
						backgroundColor: '#8C6FE6',
						borderWidth: 2,
						fill: false,
						pointBackgroundColor: '#8C6FE6',
						pointBorderColor: '#7E6CAB',
						pointRadius: 5,
					},
				],
			},
			options: {
				elements: {
					line: {
						tension: 0.4, // smooth curve
					},
				},
				scales: {
					x: {
						grid: {
							display: false, // delete vertical lines on chart
						},
					},
					y: {
						beginAtZero: false,
						min: 60,
						max: 180,
						grid: {
							display: true, // display horizontal lines
						},
					},
				},
				plugins: {
					legend: {
						display: false,
						maintainAspectRatio: false,
					},
				},
				layout: {
					padding: 5,
				},
			},
		})
	}

	// function to display patient information
	function displayPatientInfo(patient) {
		const bloodPressureHistory = patient.diagnosis_history.map(diagnosis => ({
			month: diagnosis.month,
			year: diagnosis.year,
			blood_pressure: diagnosis.blood_pressure,
		}))

		const currentBloodPressure =
			bloodPressureHistory[bloodPressureHistory.length - 1]

		// updating information in HTML elements
		document.querySelector('#person-photo').src = patient.profile_picture
		document.querySelector('#person-name').textContent = patient.name
		document.querySelector(
			'#person-dob'
		).textContent = `${patient.date_of_birth}`
		document.querySelector('#person-gender').textContent = `${patient.gender}`
		document.querySelector(
			'#person-contact'
		).textContent = `${patient.phone_number}`
		document.querySelector(
			'#person-emergency'
		).textContent = `${patient.emergency_contact}`
		document.querySelector(
			'#person-insurance'
		).textContent = `${patient.insurance_type}`

		// update current blood pressure values
		document.querySelector('#systolic-value').textContent =
			currentBloodPressure.blood_pressure.systolic.value
		document.querySelector('#diastolic-value').textContent =
			currentBloodPressure.blood_pressure.diastolic.value

		// update patient vitals
		updateVitals(
			patient.diagnosis_history[0].heart_rate.value,
			patient.diagnosis_history[0].respiratory_rate.value,
			patient.diagnosis_history[0].temperature.value
		)

		// update other information about patient
		updateDiagnosticList(patient.diagnostic_list)
		updateLabResults(patient.lab_results)
		updateBloodPressureChart(bloodPressureHistory)
	}

	// function for updating the list of diagnoses
	function updateDiagnosticList(diagnosticList) {
		const diagnosticListContainer = document.querySelector('.list-container')
		diagnosticListContainer.innerHTML = ''

		diagnosticList.forEach(diagnostic => {
			const diagnosticDiv = document.createElement('div')
			diagnosticDiv.classList.add('diagnostic-list')

			const namePara = document.createElement('p')
			const descriptionPara = document.createElement('p')
			const statusPara = document.createElement('p')

			namePara.textContent = diagnostic.name
			descriptionPara.textContent = diagnostic.description
			statusPara.textContent = diagnostic.status

			diagnosticDiv.appendChild(namePara)
			diagnosticDiv.appendChild(descriptionPara)
			diagnosticDiv.appendChild(statusPara)

			diagnosticListContainer.appendChild(diagnosticDiv)
		})
	}

	// function for updating laboratory results
	function updateLabResults(labResults) {
		const resultContainer = document.querySelector('.result-container')
		resultContainer.innerHTML = ''

		labResults.forEach(result => {
			const resultHTML = `
				<div class="result-item">
					<p class="result-name">${result}</p>
					<button class="result-btn">
						<img src="./imgs/svgs/download.svg" alt="download">
					</button>
				</div>
			`

			resultContainer.innerHTML += resultHTML
		})
	}

	// function to update vital signs
	function updateVitals(heartRate, respiratoryRate, temperature) {
		document.getElementById('heart-rate-value').textContent = heartRate
		document.getElementById('respiratory-rate-value').textContent =
			respiratoryRate
		document.getElementById('temperature-value').textContent = temperature
	}

	// call a function to get patient data
	fetchPatientData()
})

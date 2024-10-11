$(document).ready(function () {
 let countryCodes = [];
 let selectedCountry = null;

 function showNotification(message, type) {
  const notification = $('#notification');
  notification.text(message);
  notification.removeClass('notification-error notification-success');
  notification.addClass(`notification-${type}`);
  notification.fadeIn();

  setTimeout(() => {
   notification.fadeOut();
  }, 3000);
 }

 $.getJSON('codes.json', function (data) {
  countryCodes = data;
  populateCountryOptions();
 });

 function populateCountryOptions() {
  const optionsContainer = $('.country-select__options');
  countryCodes.forEach((country) => {
   const option = $('<div>')
    .addClass('country-select__option')
    .html(
     `
                    <img class="country-select__flag" src="https://flagcdn.com/${country.code.toLowerCase()}.svg" alt="${country.name} flag">
                    <span>${country.name} (${country.dial_code})</span>
                    `
    )
    .data('country', country);
   optionsContainer.append(option);
  });
 }

 $('.country-select__toggle').on('click', function () {
  $('.country-select__options').toggle();
  $('.country-select__arrow').toggleClass('fa-chevron-down fa-chevron-up');
 });

 $(document).on('click', function (event) {
  if (!$(event.target).closest('.country-select').length) {
   $('.country-select__options').hide();
   $('.country-select__arrow').removeClass('fa-chevron-up').addClass('fa-chevron-down');
  }
 });

 $('.country-select__options').on('click', '.country-select__option', function () {
  selectedCountry = $(this).data('country');
  $('.country-select__toggle .country-select__flag').attr('src', `https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`);
  $('.country-select__toggle .country-select__name').text(selectedCountry.name);
  $('.country-select__options').hide();
  $('.country-select__arrow').removeClass('fa-chevron-up').addClass('fa-chevron-down');
  $('#phone').attr('placeholder', selectedCountry.example_number || 'Enter phone number');
  $('#phone').val('');
 });

 // Implement the search functionality
 $('#countrySearch').on('input', function () {
  const searchTerm = $(this).val().toLowerCase();
  $('.country-select__option').each(function () {
   const optionText = $(this).text().toLowerCase();
   $(this).toggle(optionText.includes(searchTerm));
  });
 });

 function formatPhoneNumber(phoneNumber, format) {
  let formattedNumber = phoneNumber;
  if (format) {
   let numberIndex = 0;
   formattedNumber = format.replace(/\./g, function () {
    return phoneNumber[numberIndex++] || '';
   });
  }
  return formattedNumber;
 }

 $('#phone').on('input', function () {
  if (selectedCountry) {
   let phoneNumber = this.value.replace(/\D/g, '');
   if (phoneNumber.startsWith(selectedCountry.dial_code.replace('+', ''))) {
    phoneNumber = phoneNumber.slice(selectedCountry.dial_code.length - 1);
   }
   const formattedNumber = formatPhoneNumber(phoneNumber, selectedCountry.format);
   $(this).val(formattedNumber);
  }
 });

 $('#phoneForm').on('submit', function (e) {
  e.preventDefault();

  if (!selectedCountry) {
   showNotification('Please select a country', 'error');
   return;
  }

  const phoneNumber = $('#phone').val().replace(/\D/g, '');
  if (phoneNumber.length === 0) {
   showNotification('Please enter a phone number', 'error');
   return;
  }

  const fullPhoneNumber = selectedCountry.dial_code.replace('+', '') + phoneNumber;

  $('#phoneForm').hide();
  $('#loader').show();

  $.ajax({
   url: `/pair?phone=${fullPhoneNumber}`,
   method: 'GET',
   success: function (response) {
    $('#loader').hide();
    $('#result').text(response.code).fadeIn();
    $('#copyButton').fadeIn();
   },
   error: function () {
    $('#loader').hide();
    $('#phoneForm').show();
    showNotification('An error occurred. Please try again.', 'error');
   },
  });
 });

 $('#copyButton').on('click', function () {
  const code = $('#result').text();
  navigator.clipboard.writeText(code).then(
   function () {
    $('#copyButton').text('Copied!');
    setTimeout(function () {
     $('#copyButton').html('<i class="far fa-copy"></i> Copy');
    }, 2000);
   },
   function (err) {
    console.error('Could not copy text: ', err);
    showNotification('Failed to copy. Please try again.', 'error');
   }
  );
 });

 $('#themeToggle').on('click', function () {
  $('body').toggleClass('dark-mode');
  $(this).html($('body').hasClass('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>');
 });
});

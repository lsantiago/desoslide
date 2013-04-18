/*
Version Alpha
jQuery: desoSlide plugin - jquery.desoslide.js
Copyright - 2013 - https://github.com/sylouuu/desoslide
This source code is under the MIT License
*/
(function($) {
    $.fn.desoSlide = function(options) {
	
		// default values
		var defaults = {
			mainImage: false, // main image selector
			insertion: 'append', // wrapper insertion type
			autoLoad: true, // preloading images
			autoStart: false, // autostarting diaporama
			firstImg: 0, // index of the first image to show
			enableCaption: true, // show caption: data-caption required
			displayCaption: 'always', // type of show (caption) 'always' or 'hover'
			enableControls: true, // able to control (prev/pause/play/next)
			interval: 3000, // interval between each image
			displayWarnings: true, // show warnings in console
			displayErrors: true // show errors in console
		};

		// extend options
		var p = $.extend(defaults, options); 
		
		// *****************
		// [BEGIN] Variables
		// *****************

		var delay = (function(){
			var timer = 0;
			return function(callback, ms){
				clearTimeout (timer);
				timer = setTimeout(callback, ms);
			};
		})();
		
		var returnValue = this,
		$thumbsContainer = returnValue,
		$thumbs = $('li', $thumbsContainer),
		thumbsCount = $thumbs.length,
		currentImg = p.firstImg,
		imgToShow, 
		$overlay = $('.desoSlide-overlay', $(p.mainImage)),
		ms = (p.interval < 1500) ? 1500 : p.interval,
		timer = false, aExists, hrefExists, 
		src, alt, caption, href,
		$controlsWrapper;

		// *****************
		// [END] Variables
		// *****************
		
		var app = {
		
			// *****************
			// [BEGIN] Checks
			// *****************
			
			checks: function() {
				// if the container does not exist
				if($thumbsContainer.length == 0) {
					app.displayError($thumbsContainer.selector +' doesn\'t exist.');
					console.log('là');
				}
				
				// mainImage param checks
				if(!p.mainImage) {
					app.displayError('You must specify the "mainImage" param. Check out the documentation.');
				} else {
					// if the container does not exist
					if($(p.mainImage).length == 0) {
						app.displayError($(p.mainImage).selector +' doesn\'t exist.');
					}
				}
				
				// displayCaption param checker
				if(p.displayCaption != 'always' && p.displayCaption != 'hover') {
					app.displayError('Bad value for the "displayCaption" param. Check out the documentation.');
				}

				if(currentImg >= thumbsCount) {
					if(thumbsCount == 0) {
						app.displayError('You must have at least 1 thumbnail.');
					} else {
						app.displayError('The "firstImg" param must be between 0 and '+ (thumbsCount - 1) +'.');
					}
				}
			},
			
			checkData: function() {
				// captions checks
				if(p.enableCaption && (typeof caption === 'undefined' || caption == '')) {
					app.displayWarning('The captions are enabled and the data-caption attribute is missing on a thumb. Add it or disable captions. Check out the documention.');
				}
				
				// W3C check
				if(typeof alt === 'undefined' || alt == '') {
					app.displayWarning('The alt attribute is missing on a thumb, it\'s mandatory on <img> tags.');
				}
			},
			
			// *****************
			// [END] Checks
			// *****************
			
			// *****************
			// [BEGIN] Init
			// *****************
			
			init: function() {
				
				// auto load images
				if(p.autoLoad) {
					$('a', $thumbs).each(function(i, item) {
						$('<img>', {
							src: item.href,
							alt: ''
						}).hide().appendTo('body');
					});
				}
				
				app.addWrapper();
			},
			
			// *****************
			// [END] Init
			// *****************
			
			// *****************
			// [BEGIN] Functions
			// *****************
			
			// adding the wrapper
			addWrapper: function() {
				// the wrapper tag
				var $wrapper = $('<div>', {
					'class': 'desoSlide-wrapper'
				});
				
				// the img tag
				var $img = $('<img>').hide();
				
				// DOM insertion
				switch(p.insertion) {
					case 'prepend':
						$img.prependTo($(p.mainImage)).wrap($wrapper);
					break;
					case 'append':
						$img.appendTo($(p.mainImage)).wrap($wrapper);
					break;
					case 'replace':
						$(p.mainImage).html($img).wrapInner($wrapper);
					break;
					default:
						app.displayError('Bad value for the "insertion" param. Check out the documentation.');
					break;
				}
				
				app.displayImg();
			},
			
			
			// displaying the new image
			displayImg: function() {
				imgToShow;
				
				// count reset
				if(currentImg == -1){
					currentImg = thumbsCount - 1;
				}
				
				// count reset
				if(currentImg >= thumbsCount) {
					currentImg = 0;
				}
				
				// next image
				imgToShow = currentImg;
				
				// data
				src = $('a', $thumbs).eq(imgToShow).attr('href');
				alt = $('img', $thumbs).eq(imgToShow).attr('alt');
				caption = $('img', $thumbs).eq(imgToShow).data('caption');
				href = $('img', $thumbs).eq(imgToShow).data('href');
			
				// checking the data
				app.checkData();
				
				var self = this;
				var $image;
				$('img', $(p.mainImage)).stop().show().animate({
					opacity: 0
				}, 400, function() {
					$(this).attr({
						'src': src,
						'alt': alt,
						'data-caption': caption
					}).one('load', function() {
						$(this).stop().animate({
							opacity: 1
						}, 400, function() {
							app.addOverlay();
							
							// starting the loop
							if(p.autoStart) {
								currentImg++;
								
								timer = setTimeout(function() {
									app.displayImg();
								}, ms);
							}
							
						});
					});
				})
			},

			// adjusting the caption position
			addOverlay: function() {

				if(p.enableCaption || p.enableControls) {
					var width = 0;
					var height = 0;
					
					// main image position
					var pos = $('img', $(p.mainImage)).position();
					
					// main image height
					var w = $('img', $(p.mainImage)).width();
					var h = $('img', $(p.mainImage)).height();
					
					if($('.desoSlide-overlay', $(p.mainImage)).length == 0) {
						$('<div>', {
						'class': 'desoSlide-overlay'
						}).appendTo($('.desoSlide-wrapper', $(p.mainImage)));
					}
					
					$overlay = $('.desoSlide-overlay', $(p.mainImage));
					
					// calculate new width with padding-left
					var paddingLeft = parseInt($overlay.css('padding-left').replace('px', ''));
					var paddingRight = parseInt($overlay.css('padding-right').replace('px', ''));
					width = w - (paddingLeft + paddingRight);

					// calculate new height with padding-top
					var paddingTop = parseInt($overlay.css('padding-top').replace('px', ''));
					var paddingBottom = parseInt($overlay.css('padding-bottom').replace('px', ''));

					// calculate top & left
					var top = pos.top + (parseInt(h) - parseInt($overlay.height()) - (paddingTop + paddingBottom));
					var left = pos.left;

					// update the caption
					$overlay.css({
						'left': left +'px',
						'top': top +'px',
						'width': width +'px'
					});
					
					// showing the overlay if needed
					if(p.displayCaption == 'always') {
						$overlay.animate({
							opacity: 0.7
						}, 500);
					}

					// add caption
					if(p.enableCaption) {
						app.updateCaption();
					}
					
					app.addLink();
					
				} else {
					app.addLink();
				}
				
			},
			
			// updating the caption
			updateCaption: function() {
				$overlay.html(caption);
			},
			
			// adding the link on the main image & caption
			addLink: function() {
				aExists = ($('a.desoSlide_link', $(p.mainImage)).length > 0) ? true : false;
				hrefExists = (typeof href !== 'undefined' && href != '') ? true : false;

				// the <a> tag
				var $a = $('<a>', {
					'class':	'desoSlide_link',
					'href'		: href,
					'target'	: '_blank'
				});
				
				if(aExists && hrefExists) {
					// update the href
					$('img', $(p.mainImage)).parent('a').attr('href', href);
				} else if(aExists && !hrefExists) {
					// replace the <a> tag with this content
					var content = $('a.desoSlide_link', $(p.mainImage)).contents();
					$('a.desoSlide_link', $(p.mainImage)).replaceWith(content);
				} else if(!aExists && hrefExists) {
					// adding the <a> tag
					var content = $('.desoSlide-wrapper', $(p.mainImage)).contents();
					$a.appendTo($('.desoSlide-wrapper', $(p.mainImage))).html(content);
				}
				
				// add controls
				if(p.enableControls) {
					app.addControls();
				}
				
			},
			
			// add controls
			addControls: function() {		
				$('.desoSlide-controls-wrapper', $(p.mainImage)).remove();
				
				// controls buttons			
				var $prev	= '<a href="#prev"><span class="desoSlide-controls prev"></span></a>';
				var $pause	= '<a href="#pause"><span class="desoSlide-controls pause"></span></a>';
				var $play	= '<a href="#play"><span class="desoSlide-controls play"></span></a>';
				var $next	= '<a href="#next"><span class="desoSlide-controls next"></span></a>';
				
				// the wrapper
				// var $controls = $('<div>', {
					// 'class': 'desoSlide-controls-wrapper'
				// }).append($prev + $pause + $play + $next);
				var $controls = $('<div>', {
					'class': 'desoSlide-controls-wrapper'
				}).append($pause + $play);
				
				// dynamic positioning
				$controls.css({
					'width': $overlay.css('width'),
					'left': $overlay.css('left')
				});
				
				// adding the controls wrapper
				if($('a.desoSlide_link', $(p.mainImage)).length > 0) {
					$controls.appendTo($('a.desoSlide_link', $(p.mainImage)));
				} else {
					$controls.appendTo($('.desoSlide-wrapper', $(p.mainImage)));
				}
				
				$controlsWrapper = $('.desoSlide-controls-wrapper', $(p.mainImage));
				
				if(p.autoStart) {
					$('a[href="#play"]', $controlsWrapper).hide().parent().find('a[href="#pause"]').show();
				} else {
					$('a[href="#pause"]', $controlsWrapper).hide().parent().find('a[href="#play"]').show();
				}
			},
			
			pause: function() {
				if(p.autoStart && timer) {
					console.log('pause');
					p.autoStart = false;
					clearTimeout(timer);
					console.log(currentImg);
					$('a[href="#pause"]', $controlsWrapper).hide().parent().find('a[href="#play"]').show();
				}
			},
			
			play: function() {
				if(!p.autoStart) {
					console.log('play');
					p.autoStart = true;
					if(imgToShow == currentImg) {
						currentImg++;
					}
					app.displayImg();
					
					$('a[href="#play"]', $controlsWrapper).hide().parent().find('a[href="#pause"]').show();
				}
			},
			
			// displaying warning message in the console
			displayWarning: function(msg) {
				// if warnings are enable
				if(p.displayWarnings && typeof console !== 'undefined') {
					console.warn('desoSlide: '+ msg);
				}
				returnValue = false;
			},	
			
			// displaying error message in the console
			displayError: function(msg) {
				if(p.displayErrors && typeof console !== 'undefined') {
					console.error('desoSlide: '+ msg);
				}
				returnValue = false;
				console.log(returnValue);
			},
			
			// *****************
			// [END] Functions
			// *****************
			
			// ***********************
			// [BEGIN] Events handlers
			// ***********************

			events: function() {
				
				// clicking on thumbnail
				$('a', $thumbs).on('click', function(e) {
					e.preventDefault();
					var $this = $(this);
					
					// if the clicked image is not already displayed
					if($this.parent('li').index() !== currentImg) {
						// hiding the caption
						$overlay.animate({ opacity: 0 });
						
						// set the current image index
						currentImg = $this.parent('li').index();
						
						// call the displayer
						app.displayImg();
						
						app.pause();
					}
				});
				
				// hover on thumb
				$('img', $thumbs).on({
					mouseover: function() {
						$(this).stop(true, true).animate({
							opacity: 0.7
						}, 'normal');
					},
					mouseout: function() {
						$(this).stop(true, true).animate({
							opacity: 1
						}, 'fast');
					}
				});
				
				// hover on caption
				if(p.displayCaption == 'hover') {
					$(p.mainImage).on({
						mouseover: function() {
							$overlay.stop().animate({
								opacity: 0.7
							}, 400);
						},
						mouseleave: function() {
							$overlay.stop().animate({
								opacity: 0
							}, 400);
						}
					});
				}
				
				// click on control
				$(p.mainImage).on('click', '.desoSlide-controls-wrapper a', $(p.mainImage), function(e) {
					e.preventDefault();

					switch($(this).attr('href')) {
						case '#prev':
							currentImg--;
							app.pause();
							app.displayImg();
						break;
						case '#pause':
							app.pause();
						break;
						case '#play':
							app.play();
						break;
						case '#next':
							currentImg++;
							app.pause();
							app.displayImg();
						break;
					}
				});
				
				// new caption position when resizing
				$(window).bind('resize', function() {
					if(p.enableCaption && returnValue.selector == $thumbsContainer.selector) {
						delay(function(){
							console.log('resizing');
							app.addOverlay();
						}, 100);
					}
				});
				
			},
			
			// ***********************
			// [END] Events handlers
			// ***********************
		};
		
		$(window).load(function() {
			// initializing
			app.checks();
			app.init();
			app.events();
		});
		
		return returnValue;

    };
})(jQuery);
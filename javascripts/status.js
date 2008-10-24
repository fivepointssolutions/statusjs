/*
 *  status.js
 *
 *  dependencies: prototype.js, effects.js, lowpro.js
 *  
 *  --------------------------------------------------------------------------
 *  
 *  Allows you to display a status message when submiting a form. To use,
 *  simply add the following to application.js:
 *  
 *    Event.addBehavior({'form': Status.FormBehavior()});
 *  
 *  And then add an "onsubmit_status" to each form that you want to display
 *  a status message on submit for:
 *  
 *    <form onsubmit_status="Saving changes" ...>
 *  
 *  Based on code from popup.js.
 *  
 *  --------------------------------------------------------------------------
 *  
 *  Copyright (c) 2008, John W. Long
 *  Portions copyright (c) 2008, Five Points Solutions, Inc.
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a
 *  copy of this software and associated documentation files (the "Software"),
 *  to deal in the Software without restriction, including without limitation
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *  and/or sell copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *  DEALINGS IN THE SOFTWARE.
 *  
 */

var Status = {
  CornerThickness: 12,
  SpinnerImage: '/images/status_spinner.gif',
  SpinnerImageWidth: 32,
  SpinnerImageHeight: 33,
  BackgroundImage: '/images/status_background.png',
  TopLeftImage: '/images/status_top_left.png',
  TopRightImage: '/images/status_top_right.png',
  BottomLeftImage: '/images/status_bottom_left.png',
  BottomRightImage: '/images/status_bottom_right.png',
  Modal: true
};

Status.BackgroundImages = function() {
  return $A([
    Status.SpinnerImage,
    Status.BackgroundImage,
    Status.TopLeftImage,
    Status.TopRightImage,
    Status.BottomLeftImage,
    Status.BottomRightImage
  ]);
}

Status.preloadImages = function() {
  if (!Status.imagesPreloaded) {
    Status.BackgroundImages().each(function(src) {
      var image = new Image();
      image.src = src;
    });
    Status.preloadedImages = true;
  }
}

Status.FormBehavior = Behavior.create({
  initialize: function() {
    var attr = this.element.attributes['onsubmit_status']
    if (attr) this.status = attr.value; 
    if (this.status) this.element.observe('submit', function() { showStatus(this.status) }.bind(this));
  }
});

Status.LinkBehavior = Behavior.create({
  initialize: function() {
    var attr = this.element.attributes['onclick_status']
    if (attr) this.status = attr.value; 
    if (this.status) this.element.observe('click', function() { showStatus(this.status) }.bind(this));
  }
});

Status.Window = Class.create({
  initialize: function() {
    Status.preloadImages();
    this.buildWindow();
  },
  
  buildWindow: function() {
    this.element = $table({className: 'status_window', style: 'display: none; position: absolute; border-collapse: collapse; padding: 0px; margin: 0px; z-index: 10000'});
    var tbody = $tbody();
    this.element.insert(tbody)
    
    var top_row = $tr();
    top_row.insert($td({style: 'background: url(' + Status.TopLeftImage + '); height: ' + Status.CornerThickness + 'px; width: ' + Status.CornerThickness + 'px; padding: 0px'}));
    top_row.insert($td({style: 'background: url(' + Status.BackgroundImage + '); height: ' + Status.CornerThickness + 'px; padding: 0px'}))
    top_row.insert($td({style: 'background: url(' + Status.TopRightImage + '); height: ' + Status.CornerThickness + 'px; width: ' + Status.CornerThickness + 'px; padding: 0px'}));
    tbody.insert(top_row);
    
    var content_row = $tr();
    content_row.insert($td({style: 'background: url(' + Status.BackgroundImage + '); width: ' + Status.CornerThickness + 'px; padding: 0px'}, ''));
    this.content = $td({className: 'status_content', style: 'background: url(' + Status.BackgroundImage + '); padding: 0px ' + Status.CornerThickness + 'px'});
    content_row.insert(this.content);
    content_row.insert($td({style: 'background: url(' + Status.BackgroundImage + '); width: ' + Status.CornerThickness + 'px; padding: 0px'}, ''));
    tbody.insert(content_row);
    
    var bottom_row = $tr();
    bottom_row.insert($td({style: 'background: url(' + Status.BottomLeftImage + '); height: ' + Status.CornerThickness + 'px; width: ' + Status.CornerThickness + 'px; padding: 0px'}));
    bottom_row.insert($td({style: 'background: url(' + Status.BackgroundImage + '); height: ' + Status.CornerThickness + 'px; padding: 0px'}))
    bottom_row.insert($td({style: 'background: url(' + Status.BottomRightImage + '); height: ' + Status.CornerThickness + 'px; width: ' + Status.CornerThickness + 'px; padding: 0px'}));
    tbody.insert(bottom_row);
    
    this.spinner = $img({src: Status.SpinnerImage, width: Status.SpinnerImageWidth, height: Status.SpinnerImageHeight, alt: ''});
    this.status = $div()
    
    var table = $table({border: 0, cellpadding: 0, cellspacing: 0, style: 'table-layout: auto'},
      $tbody(
        $tr(
          $td({style: 'width: ' + Status.SpinnerImageWidth + 'px'}, this.spinner),
          $td({style: 'padding-left: ' + Status.CornerThickness + 'px'}, this.status)
        )
      )
    );
    this.content.insert(table);
    
    var body = $$('body').first();
    body.insert(this.element);
  },
  
  setStatus: function(value) {
    this.status.update(value)
  },
  
  getStatus: function() {
    return this.status.innerHTML();
  },
  
  show: function(options) {
    this.centerWindowInView();
    if (Status.Modal) this._captureAllEvents();
    this.element.show();
  },
  
  hide: function() {
    if (Status.Modal) this._releaseEventCapture();
    this.element.hide();
  },
  
  toggle: function() {
    if (this.visible()) {
      this.hide();
    } else {
      this.show();
    }
  },
  
  visible: function() {
    return this.element.visible();
  },
  
  centerWindowInView: function() {
    var offsets = document.viewport.getScrollOffsets();
    this.element.setStyle({
      left: parseInt(offsets.left + (document.viewport.getWidth() - this.element.getWidth()) / 2) + 'px',
      top: parseInt(offsets.top + (document.viewport.getHeight() - this.element.getHeight()) / 2.2) + 'px'
    });
  },
  
  _eventsForCapture: function() {
    return $A(['click', 'keydown', 'keyup', 'mousedown', 'mouseover', 'mouseout', 'mouseup']);
  },
  
  _captureAllEvents: function() {
    this.eventHandler = function(e) { e.stop() };
    this._eventsForCapture().each(function(action) {
      document.body.addEventListener(action, this.eventHandler, true) // Observe events during the capture phase, rather than the bubbling
    }.bind(this));
  },
  
  _releaseEventCapture: function() {
    this._eventsForCapture().each(function(action) {
      document.body.removeEventListener(action, this.eventHandler, true)
    }.bind(this));
  }
});

// Setup the status window on dom loaded
Event.observe(document, 'dom:loaded', function() {
  Status.window = new Status.Window();
});

// Sets the status to string
function setStatus(string) {
  Status.window.setStatus(string);
  if (Status.window.visible()) Status.window.centerWindowInView();
}

// Sets the status to string and shows the modal status window
function showStatus(string) {
  setStatus(string);
  Status.window.show();
}

// Hides the modal status window
function hideStatus() {
  Status.window.hide();
}
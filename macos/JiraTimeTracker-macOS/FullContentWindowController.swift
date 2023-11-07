import SwiftUI

open class FullContentWindowController: NSWindowController {
  
  private let fullContentWindow: FullContentWindow
  private let fullContentViewController = NSViewController()
  
  var titleBarContentContainer = NSView()
  var contentContainer = NSView()
  
  
  // private lazy var titleOffsetConstraint = titleBarContentContainer.leadingAnchor.constraint(equalTo: fullContentViewController.contentView.leadingAnchor)
  
  public init(contentRect: CGRect, titleBarHeight: CGFloat, titleBarLeadingOffset: CGFloat? = nil) {
    fullContentWindow = FullContentWindow(contentRect: contentRect, titleBarHeight: titleBarHeight,
                                          titleBarLeadingOffset: titleBarLeadingOffset)
    // super.init(window: fullContentWindow, viewController: fullContentViewController)
    super.init(window: fullContentWindow)
    // contentWindow.delegate = self
    fullContentViewController.view.addSubview(titleBarContentContainer)
    fullContentViewController.view.addSubview(contentContainer)
    
    let standardWindowButtonsRect = fullContentWindow.standardWindowButtonsRect
    
    // LayoutConstraint.withFormat("V:|[*][*]|", titleBarContentContainer, contentContainer).activate()
    // LayoutConstraint.pin(to: .horizontally, contentContainer).activate()
    // LayoutConstraint.constrainHeight(constant: standardWindowButtonsRect.height, titleBarContentContainer).activate()
    // LayoutConstraint.withFormat("[*]|", titleBarContentContainer).activate()
    // titleOffsetConstraint.activate()
    
    // titleOffsetConstraint.constant = standardWindowButtonsRect.maxX
  }
  
  open override func prepareForInterfaceBuilder() {
    titleBarContentContainer.layer?.backgroundColor = CGColor.init(red: 0, green: 255, blue: 0, alpha: 1)
    contentContainer.layer?.backgroundColor = CGColor.init(red: 255, green: 255, blue: 0, alpha: 1)
    fullContentViewController.view.layer?.backgroundColor = CGColor(red: 0, green: 0, blue: 255, alpha: 1)
    fullContentWindow.titleBarAccessoryViewController.view.layer?.backgroundColor = CGColor(red: 255, green: 0, blue: 0, alpha: 0.4)
  }
  
  public required init?(coder: NSCoder) {
    fatalError()
  }
}

extension FullContentWindowController {
  
  public func embedTitleBarContent(_ viewController: NSViewController) {
    viewController.view.addSubview(titleBarContentContainer)
    fullContentViewController.addChild(viewController)
  }
  
  public func embedContent(_ viewController: NSViewController) {
    viewController.view.addSubview(contentContainer)
    fullContentViewController.addChild(viewController)
  }
}

extension FullContentWindowController: NSWindowDelegate {
  
  public func windowWillEnterFullScreen(_ notification: Notification) {
    fullContentWindow.titleBarAccessoryViewController.isHidden = true
    // titleOffsetConstraint.constant = 0
  }
  
  public  func windowWillExitFullScreen(_ notification: Notification) {
    fullContentWindow.titleBarAccessoryViewController.isHidden = false
    // titleOffsetConstraint.constant = fullContentWindow.standardWindowButtonsRect.maxX
  }
}

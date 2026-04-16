import SwiftUI
import WebKit
import UserNotifications

struct WebView: NSViewRepresentable {
    let htmlFileName: String
    let htmlFileExtension: String
    @Binding var isLoading: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(isLoading: $isLoading)
    }

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.applicationNameForUserAgent = "TellMeApp/1.0"
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        config.userContentController.add(context.coordinator, name: "tellmeNative")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        isLoading = true
        loadLocalHTML(in: webView)
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler, UNUserNotificationCenterDelegate {
        private var isLoading: Binding<Bool>
        private var unreadCount = 0

        init(isLoading: Binding<Bool>) {
            self.isLoading = isLoading
            super.init()
            UNUserNotificationCenter.current().delegate = self
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            isLoading.wrappedValue = false
        }

        func webView(
            _ webView: WKWebView,
            didFail navigation: WKNavigation!,
            withError error: Error
        ) {
            isLoading.wrappedValue = false
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            isLoading.wrappedValue = false
        }

        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard message.name == "tellmeNative" else { return }
            guard let body = message.body as? [String: Any] else { return }
            guard let type = body["type"] as? String else { return }

            if type == "requestNotifications" {
                requestNotificationAuthorization()
                return
            }

            if type == "newMessage" {
                let title = (body["title"] as? String) ?? "TellMe 👂"
                let text = (body["body"] as? String) ?? "You have a new anonymous question."
                unreadCount += 1
                DispatchQueue.main.async {
                    NSApplication.shared.dockTile.badgeLabel = "\(self.unreadCount)"
                    NSApplication.shared.dockTile.display()
                }
                showSystemNotification(title: title, body: text)
                return
            }

            if type == "setBadge" {
                let rawCount = body["count"] as? Int ?? 0
                unreadCount = max(0, rawCount)
                DispatchQueue.main.async {
                    NSApplication.shared.dockTile.badgeLabel = self.unreadCount > 0 ? "\(self.unreadCount)" : nil
                    NSApplication.shared.dockTile.display()
                }
                return
            }

            if type == "clearBadge" {
                unreadCount = 0
                DispatchQueue.main.async {
                    NSApplication.shared.dockTile.badgeLabel = nil
                    NSApplication.shared.dockTile.display()
                }
            }
        }

        func userNotificationCenter(
            _ center: UNUserNotificationCenter,
            willPresent notification: UNNotification,
            withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
        ) {
            completionHandler([.banner, .list, .sound, .badge])
        }

        private func requestNotificationAuthorization() {
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
        }

        private func showSystemNotification(title: String, body: String) {
            let content = UNMutableNotificationContent()
            content.title = title
            content.body = body
            content.sound = .default
            content.badge = NSNumber(value: unreadCount)

            let request = UNNotificationRequest(
                identifier: UUID().uuidString,
                content: content,
                trigger: nil
            )
            UNUserNotificationCenter.current().add(request)
        }
    }

    private func loadLocalHTML(in webView: WKWebView) {
        guard let url = Bundle.main.url(forResource: htmlFileName, withExtension: htmlFileExtension) else {
            print("❌ Missing \(htmlFileName).\(htmlFileExtension) — build should copy from repo root tellme.html")
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }
}

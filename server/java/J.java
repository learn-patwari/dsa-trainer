import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * Harness helpers: a small JSON reader for LeetCode's test inputs, converters to Java
 * types, LeetCode-style serialization of results, and the result protocol read by the app.
 * Copied next to your Solution when you press "Compile & run"; it is never part of your code.
 */
final class J {
    private J() {}

    // ------------------------------------------------------------ parsing

    static Object parse(String s) {
        return new P(s).value();
    }

    private static final class P {
        private final String s;
        private int i;

        P(String s) { this.s = s; }

        void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }

        Object value() {
            ws();
            if (i >= s.length()) return null;
            char c = s.charAt(i);
            if (c == '[') return array();
            if (c == '"') return string();
            if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
            if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
            if (s.startsWith("null", i)) { i += 4; return null; }
            return number();
        }

        List<Object> array() {
            List<Object> out = new ArrayList<>();
            i++; // [
            ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return out; }
            while (i < s.length()) {
                out.add(value());
                ws();
                if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
                if (i < s.length() && s.charAt(i) == ']') i++;
                break;
            }
            return out;
        }

        String string() {
            StringBuilder b = new StringBuilder();
            i++; // opening quote
            while (i < s.length()) {
                char c = s.charAt(i++);
                if (c == '"') break;
                if (c == '\\' && i < s.length()) {
                    char e = s.charAt(i++);
                    if (e == 'n') b.append('\n');
                    else if (e == 't') b.append('\t');
                    else if (e == 'r') b.append('\r');
                    else if (e == 'b') b.append('\b');
                    else if (e == 'f') b.append('\f');
                    else if (e == 'u' && i + 4 <= s.length()) { b.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); i += 4; }
                    else b.append(e);
                } else {
                    b.append(c);
                }
            }
            return b.toString();
        }

        Object number() {
            int start = i;
            while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
            String t = s.substring(start, i);
            if (t.isEmpty()) { i++; return null; }
            if (t.indexOf('.') >= 0 || t.indexOf('e') >= 0 || t.indexOf('E') >= 0) return Double.valueOf(t);
            return Long.valueOf(t);
        }
    }

    /** The app writes a JSON array of cases, each an array of raw LeetCode input lines. */
    static List<List<String>> readCases(String path) throws IOException {
        Object o = parse(new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8));
        List<List<String>> cases = new ArrayList<>();
        for (Object c : list(o)) {
            List<String> args = new ArrayList<>();
            for (Object a : list(c)) args.add(a == null ? "null" : String.valueOf(a));
            cases.add(args);
        }
        return cases;
    }

    // ------------------------------------------------------------ converters

    @SuppressWarnings("unchecked")
    static List<Object> list(Object o) {
        return o instanceof List ? (List<Object>) o : new ArrayList<>();
    }

    static long toLong(Object o) { return o instanceof Number ? ((Number) o).longValue() : Long.parseLong(String.valueOf(o).trim()); }
    static int toInt(Object o) { return (int) toLong(o); }
    static double toDouble(Object o) { return o instanceof Number ? ((Number) o).doubleValue() : Double.parseDouble(String.valueOf(o).trim()); }
    static boolean toBool(Object o) { return o instanceof Boolean ? (Boolean) o : Boolean.parseBoolean(String.valueOf(o).trim()); }
    static String toStr(Object o) { return o == null ? null : String.valueOf(o); }
    static char toChar(Object o) { String s = toStr(o); return s == null || s.isEmpty() ? ' ' : s.charAt(0); }

    static int[] toIntArray(Object o) {
        List<Object> l = list(o);
        int[] a = new int[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toInt(l.get(k));
        return a;
    }

    static long[] toLongArray(Object o) {
        List<Object> l = list(o);
        long[] a = new long[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toLong(l.get(k));
        return a;
    }

    static double[] toDoubleArray(Object o) {
        List<Object> l = list(o);
        double[] a = new double[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toDouble(l.get(k));
        return a;
    }

    static boolean[] toBoolArray(Object o) {
        List<Object> l = list(o);
        boolean[] a = new boolean[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toBool(l.get(k));
        return a;
    }

    static char[] toCharArray(Object o) {
        List<Object> l = list(o);
        char[] a = new char[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toChar(l.get(k));
        return a;
    }

    static String[] toStringArray(Object o) {
        List<Object> l = list(o);
        String[] a = new String[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toStr(l.get(k));
        return a;
    }

    static int[][] toIntArray2(Object o) {
        List<Object> l = list(o);
        int[][] a = new int[l.size()][];
        for (int k = 0; k < a.length; k++) a[k] = toIntArray(l.get(k));
        return a;
    }

    static char[][] toCharArray2(Object o) {
        List<Object> l = list(o);
        char[][] a = new char[l.size()][];
        for (int k = 0; k < a.length; k++) a[k] = toCharArray(l.get(k));
        return a;
    }

    static String[][] toStringArray2(Object o) {
        List<Object> l = list(o);
        String[][] a = new String[l.size()][];
        for (int k = 0; k < a.length; k++) a[k] = toStringArray(l.get(k));
        return a;
    }

    static double[][] toDoubleArray2(Object o) {
        List<Object> l = list(o);
        double[][] a = new double[l.size()][];
        for (int k = 0; k < a.length; k++) a[k] = toDoubleArray(l.get(k));
        return a;
    }

    static List<Integer> toListInt(Object o) {
        List<Integer> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toInt(x));
        return out;
    }

    static List<Double> toListDouble(Object o) {
        List<Double> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toDouble(x));
        return out;
    }

    static List<Boolean> toListBool(Object o) {
        List<Boolean> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toBool(x));
        return out;
    }

    static List<String> toListStr(Object o) {
        List<String> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toStr(x));
        return out;
    }

    static List<List<Integer>> toListListInt(Object o) {
        List<List<Integer>> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toListInt(x));
        return out;
    }

    static List<List<String>> toListListStr(Object o) {
        List<List<String>> out = new ArrayList<>();
        for (Object x : list(o)) out.add(toListStr(x));
        return out;
    }

    static ListNode[] toListNodeArray(Object o) {
        List<Object> l = list(o);
        ListNode[] a = new ListNode[l.size()];
        for (int k = 0; k < a.length; k++) a[k] = toListNode(l.get(k));
        return a;
    }

    static ListNode toListNode(Object o) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (Object x : list(o)) { tail.next = new ListNode(toInt(x)); tail = tail.next; }
        return dummy.next;
    }

    /** Level-order array with nulls, exactly as LeetCode prints trees. */
    static TreeNode toTreeNode(Object o) {
        List<Object> vals = list(o);
        if (vals.isEmpty() || vals.get(0) == null) return null;
        TreeNode root = new TreeNode(toInt(vals.get(0)));
        Deque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.size()) {
            TreeNode node = q.poll();
            if (i < vals.size()) {
                Object left = vals.get(i++);
                if (left != null) { node.left = new TreeNode(toInt(left)); q.add(node.left); }
            }
            if (i < vals.size()) {
                Object right = vals.get(i++);
                if (right != null) { node.right = new TreeNode(toInt(right)); q.add(node.right); }
            }
        }
        return root;
    }

    // ------------------------------------------------------------ serializing

    static String ser(Object o) {
        if (o == null) return "null";
        if (o instanceof String) return quote((String) o);
        if (o instanceof Character) return quote(String.valueOf(o));
        if (o instanceof Boolean || o instanceof Integer || o instanceof Long || o instanceof Short || o instanceof Byte) return String.valueOf(o);
        if (o instanceof Double || o instanceof Float) {
            double d = ((Number) o).doubleValue();
            return d == Math.rint(d) && !Double.isInfinite(d) ? String.valueOf((long) d) + ".0" : String.valueOf(d);
        }
        if (o instanceof int[]) return join(box((int[]) o));
        if (o instanceof long[]) return join(box((long[]) o));
        if (o instanceof double[]) return join(box((double[]) o));
        if (o instanceof boolean[]) return join(box((boolean[]) o));
        if (o instanceof char[]) return join(box((char[]) o));
        if (o instanceof Object[]) return join(java.util.Arrays.asList((Object[]) o));
        if (o instanceof List) return join((List<?>) o);
        if (o instanceof ListNode) return serList((ListNode) o);
        if (o instanceof TreeNode) return serTree((TreeNode) o);
        return quote(String.valueOf(o));
    }

    private static List<Object> box(int[] a) { List<Object> l = new ArrayList<>(); for (int x : a) l.add(x); return l; }
    private static List<Object> box(long[] a) { List<Object> l = new ArrayList<>(); for (long x : a) l.add(x); return l; }
    private static List<Object> box(double[] a) { List<Object> l = new ArrayList<>(); for (double x : a) l.add(x); return l; }
    private static List<Object> box(boolean[] a) { List<Object> l = new ArrayList<>(); for (boolean x : a) l.add(x); return l; }
    private static List<Object> box(char[] a) { List<Object> l = new ArrayList<>(); for (char x : a) l.add(x); return l; }

    private static String join(List<?> items) {
        StringBuilder b = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) b.append(',');
            b.append(ser(items.get(i)));
        }
        return b.append(']').toString();
    }

    private static String serList(ListNode head) {
        StringBuilder b = new StringBuilder("[");
        int guard = 0;
        for (ListNode n = head; n != null && guard < 100000; n = n.next, guard++) {
            if (guard > 0) b.append(',');
            b.append(n.val);
        }
        return b.append(']').toString();
    }

    /** LeetCode prints an empty list or tree as [], not null. */
    static String serListNode(ListNode head) { return head == null ? "[]" : serList(head); }

    static String serTreeNode(TreeNode root) { return root == null ? "[]" : serTree(root); }

    /** Level order with trailing nulls trimmed, matching LeetCode's expected output. */
    private static String serTree(TreeNode root) {
        List<Object> out = new ArrayList<>();
        // LinkedList, not ArrayDeque: the queue has to hold the null children.
        Deque<TreeNode> q = new java.util.LinkedList<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n == null) { out.add(null); continue; }
            out.add(n.val);
            q.add(n.left);
            q.add(n.right);
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);
        return join(out);
    }

    static String quote(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c == '\n') b.append("\\n");
            else if (c == '\r') b.append("\\r");
            else if (c == '\t') b.append("\\t");
            else if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    // ------------------------------------------------------------ result protocol

    static void emit(int index, String out, String err, long ms, String log) {
        StringBuilder b = new StringBuilder("@@T {\"i\":").append(index)
            .append(",\"out\":").append(out == null ? "null" : quote(out))
            .append(",\"err\":").append(err == null ? "null" : quote(err))
            .append(",\"ms\":").append(ms)
            .append(",\"log\":").append(quote(log == null ? "" : log))
            .append('}');
        System.out.println(b);
        System.out.flush();
    }
}
